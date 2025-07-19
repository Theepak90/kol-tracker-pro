import os
import asyncio
import logging
import json
import traceback
import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from telethon import TelegramClient, events
from telethon.errors import SessionPasswordNeededError, PhoneCodeInvalidError, PasswordHashInvalidError
from telethon.tl.functions.messages import GetHistoryRequest
from telethon.tl.functions.channels import GetParticipantsRequest
from telethon.tl.functions.channels import GetFullChannelRequest
from telethon.tl.types import PeerChannel, InputPeerChannel, ChannelParticipantsSearch, ChannelParticipantsAdmins, ChannelParticipantsRecent
from telethon.sessions import StringSession
import motor.motor_asyncio
import uvicorn

# Import our advanced KOL detection system
from kol_detector import AdvancedKOLDetector, KOLCriteria

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Environment variables
API_ID = int(os.getenv('API_ID', '28152923'))
API_HASH = os.getenv('API_HASH', '766760d2838474a5e6dd734d785aa7ad')
SESSION_NAME = os.getenv('SESSION_NAME', 'telegram_session')
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
PORT = int(os.getenv('PORT', '8000'))

logger.info(f"API_ID: {API_ID}")
logger.info(f"API_HASH: {'set' if API_HASH else 'not set'}")
logger.info(f"SESSION_NAME: {SESSION_NAME}")
logger.info(f"PORT: {PORT}")

app = FastAPI(title="KOL Tracker Telethon Service", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize KOL detector with strict criteria for real influencers
kol_detector = AdvancedKOLDetector(
    KOLCriteria(
        min_followers=500,  # Relaxed for Telegram (many don't show follower count)
        min_engagement_rate=1.5,  # 1.5% minimum engagement
        min_posts_per_week=2.0,  # At least 2 posts per week
        min_average_views=300,  # 300+ average views
        min_forward_ratio=0.03,  # 3% forward ratio
        max_bot_probability=0.4,  # Maximum 40% bot probability
        min_account_age_days=30,  # 30+ days old account
        quality_content_threshold=0.5  # 50% content quality threshold
    )
)

# Pydantic models for authentication
class OTPRequest(BaseModel):
    phone_number: str
    user_id: str

class OTPVerifyRequest(BaseModel):
    user_id: str
    phone_number: str
    otp_code: str
    password: Optional[str] = None
    session_id: Optional[str] = None
    phone_code_hash: Optional[str] = None

# Store active authentication sessions in memory
# In production, use Redis or a database
auth_sessions = {}

class TelegramScanner:
    def __init__(self):
        self.client = None
        self.db = None
        self.connected = False
        self.user_clients = {}  # Store user-specific clients
    
    async def connect(self):
        try:
            logger.info("Connecting to MongoDB...")
            # Connect to MongoDB
            mongo_client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
            self.db = mongo_client.kol_tracker
            
            # Test MongoDB connection
            await self.db.command("ping")
            logger.info("Connected to MongoDB successfully")
            
            logger.info("Creating Telegram client...")
            # Create Telegram client
            self.client = TelegramClient(SESSION_NAME, API_ID, API_HASH)
            
            logger.info("Starting Telegram client...")
            await self.client.connect()
            
            if not await self.client.is_user_authorized():
                logger.warning("Main client not authorized. Attempting to start client anyway for user sessions.")
                logger.warning("For real analysis, users must authenticate via the frontend.")
            else:
                logger.info("✅ Main Telegram client authenticated successfully!")
                me = await self.client.get_me()
                logger.info(f"👤 Logged in as: {me.first_name} {me.last_name or ''} (@{me.username or 'No username'})")
                
            self.connected = True
            
        except Exception as e:
            logger.error(f"Failed to start services: {e}")
            # Don't raise the error, allow service to start for user authentication
            self.connected = True
    
    async def disconnect(self):
        if self.client:
            await self.client.disconnect()
        
        # Disconnect all user clients
        for client in self.user_clients.values():
            try:
                await client.disconnect()
            except:
                pass
        self.user_clients.clear()
        self.connected = False

    async def create_user_client(self, user_id: str) -> TelegramClient:
        """Create a new Telegram client for a specific user"""
        session_name = f"user_{user_id}_session"
        client = TelegramClient(StringSession(), API_ID, API_HASH)
        await client.connect()
        return client

    async def get_user_client(self, user_id: str) -> Optional[TelegramClient]:
        """Get existing user client or None"""
        client = self.user_clients.get(user_id)
        logger.info(f"Getting client for {user_id}: {'found' if client else 'not found'}")
        logger.info(f"Current stored clients: {list(self.user_clients.keys())}")
        return client
    
    async def store_user_client(self, user_id: str, client: TelegramClient):
        """Store user client for reuse"""
        self.user_clients[user_id] = client
        logger.info(f"Stored client for {user_id}. Total clients: {len(self.user_clients)}")
        logger.info(f"Current stored clients: {list(self.user_clients.keys())}")
    
    async def get_channel_info(self, channel_url: str):
        try:
            if not self.connected:
                raise HTTPException(status_code=503, detail="Service not connected")
                
            # Extract channel username from URL
            if 't.me/' in channel_url:
                username = channel_url.split('t.me/')[-1]
            else:
                username = channel_url
                
            # Get channel entity
            channel = await self.client.get_entity(username)
            
            # Get channel info
            channel_info = {
                'id': channel.id,
                'title': channel.title,
                'username': getattr(channel, 'username', None),
                'participants_count': getattr(channel, 'participants_count', 0),
                'description': getattr(channel, 'about', ''),
                'verified': getattr(channel, 'verified', False),
                'scam': getattr(channel, 'scam', False),
                'fake': getattr(channel, 'fake', False),
                'created_date': getattr(channel, 'date', datetime.now()).isoformat() if hasattr(channel, 'date') else None
            }
            
            return channel_info
            
        except Exception as e:
            logger.error(f"Error getting channel info: {e}")
            raise HTTPException(status_code=400, detail=str(e))
    
    async def analyze_channel_messages(self, channel_url: str, limit: int = 100):
        try:
            if not self.connected:
                raise HTTPException(status_code=503, detail="Service not connected")
                
            # Extract channel username from URL
            if 't.me/' in channel_url:
                username = channel_url.split('t.me/')[-1]
            else:
                username = channel_url
                
            # Get channel entity
            channel = await self.client.get_entity(username)
            
            # Get recent messages
            messages = await self.client.get_messages(channel, limit=limit)
            
            analysis = {
                'total_messages': len(messages),
                'messages': [],
                'statistics': {
                    'avg_views': 0,
                    'avg_forwards': 0,
                    'total_reactions': 0,
                    'message_frequency': 0
                }
            }
            
            total_views = 0
            total_forwards = 0
            total_reactions = 0
            
            for msg in messages:
                if msg.message:
                    message_data = {
                        'id': msg.id,
                        'date': msg.date.isoformat(),
                        'message': msg.message[:200] + '...' if len(msg.message) > 200 else msg.message,
                        'views': getattr(msg, 'views', 0),
                        'forwards': getattr(msg, 'forwards', 0),
                        'reactions': len(getattr(msg, 'reactions', [])) if hasattr(msg, 'reactions') and msg.reactions else 0
                    }
                    
                    analysis['messages'].append(message_data)
                    total_views += message_data['views']
                    total_forwards += message_data['forwards']
                    total_reactions += message_data['reactions']
            
            if len(messages) > 0:
                analysis['statistics']['avg_views'] = total_views / len(messages)
                analysis['statistics']['avg_forwards'] = total_forwards / len(messages)
                analysis['statistics']['total_reactions'] = total_reactions
                
                # Calculate message frequency (messages per day)
                if len(messages) > 1:
                    time_diff = messages[0].date - messages[-1].date
                    analysis['statistics']['message_frequency'] = len(messages) / max(time_diff.days, 1)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing channel: {e}")
            raise HTTPException(status_code=400, detail=str(e))

# Global scanner instance
scanner = TelegramScanner()

@app.on_event("startup")
async def startup_event():
    logger.info("Starting FastAPI server...")
    await scanner.connect()

@app.on_event("shutdown")
async def shutdown_event():
    await scanner.disconnect()

# Authentication endpoints
@app.post("/auth/request-otp")
async def request_otp(request: OTPRequest):
    """Request OTP for Telegram authentication"""
    try:
        logger.info(f"OTP request for {request.phone_number}")
        
        # Create a new client for this user
        client = await scanner.create_user_client(request.user_id)
        
        # Send code request
        sent_code = await client.send_code_request(request.phone_number)
        
        # Store session information
        session_id = f"auth_{request.user_id}_{uuid.uuid4().hex[:8]}"
        auth_sessions[session_id] = {
            'client': client,
            'phone_number': request.phone_number,
            'user_id': request.user_id,
            'phone_code_hash': sent_code.phone_code_hash,
            'created_at': datetime.now(),
            'attempts': 0
        }
        
        logger.info(f"OTP sent successfully to {request.phone_number}")
        
        return {
            'success': True,
            'message': f'Verification code sent to {request.phone_number}',
            'session_id': session_id,
            'phone_code_hash': sent_code.phone_code_hash
        }
        
    except Exception as e:
        logger.error(f"Error sending OTP: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to send OTP: {str(e)}")

@app.post("/auth/verify-otp")
async def verify_otp(request: OTPVerifyRequest):
    """Verify OTP and complete Telegram authentication"""
    try:
        logger.info(f"OTP verification for {request.phone_number}")
        
        # Find the authentication session
        session = auth_sessions.get(request.session_id)
        if not session:
            raise HTTPException(status_code=400, detail="Invalid or expired session")
        
        client = session['client']
        
        try:
            # Attempt to sign in with the verification code
            user = await client.sign_in(
                phone=request.phone_number,
                code=request.otp_code,
                phone_code_hash=session['phone_code_hash']
            )
            
        except SessionPasswordNeededError:
            # 2FA is required
            if not request.password:
                return {
                    'success': False,
                    'requires_2fa': True,
                    'message': '2FA password required. Please enter your cloud password.'
                }
            
            # Try with 2FA password
            try:
                user = await client.sign_in(password=request.password)
            except PasswordHashInvalidError:
                raise HTTPException(status_code=400, detail="Invalid 2FA password")
                
        except PhoneCodeInvalidError:
            session['attempts'] += 1
            if session['attempts'] >= 3:
                # Clean up session after too many attempts
                auth_sessions.pop(request.session_id, None)
                try:
                    await client.disconnect()
                except:
                    pass
            raise HTTPException(status_code=400, detail="Invalid verification code")
        
        # Get user information
        me = await client.get_me()
        
        # Store the authenticated client for this user
        await scanner.store_user_client(request.user_id, client)
        
        # Clean up auth session
        auth_sessions.pop(request.session_id, None)
        
        # Create user info response
        user_info = {
            'id': str(me.id),
            'phone_number': request.phone_number,
            'first_name': me.first_name or '',
            'last_name': me.last_name or '',
            'username': me.username or '',
            'is_verified': me.verified or False,
            'session_id': f"verified_{request.user_id}_{datetime.now().timestamp()}",
            'session_string': client.session.save()
        }
        
        logger.info(f"Authentication successful for {me.first_name} ({request.phone_number})")
        
        return {
            'success': True,
            'message': f'Successfully authenticated! Welcome {me.first_name}!',
            'user_info': user_info
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying OTP: {e}")
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

# Cleanup expired sessions periodically
@app.on_event("startup")
async def start_cleanup_task():
    async def cleanup_expired_sessions():
        while True:
            try:
                now = datetime.now()
                expired_sessions = []
                
                for session_id, session in auth_sessions.items():
                    # Sessions expire after 10 minutes
                    if now - session['created_at'] > timedelta(minutes=10):
                        expired_sessions.append(session_id)
                
                for session_id in expired_sessions:
                    session = auth_sessions.pop(session_id, None)
                    if session and 'client' in session:
                        try:
                            await session['client'].disconnect()
                        except:
                            pass
                    logger.info(f"Cleaned up expired session: {session_id}")
                
                # Sleep for 5 minutes before next cleanup
                await asyncio.sleep(300)
                
            except Exception as e:
                logger.error(f"Error in cleanup task: {e}")
                await asyncio.sleep(60)  # Try again in 1 minute
    
    asyncio.create_task(cleanup_expired_sessions())

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "connected": scanner.connected,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/channel/info/{channel_url:path}")
async def get_channel_info(channel_url: str):
    return await scanner.get_channel_info(channel_url)

@app.get("/channel/analyze/{channel_url:path}")
async def analyze_channel(channel_url: str, limit: int = 100):
    return await scanner.analyze_channel_messages(channel_url, limit)

@app.get("/scan/{username}")
async def scan_channel(username: str, user_id: str = None):
    try:
        logger.info(f"Scanning channel: {username}")
        
        # Try to get user-specific client first
        client = None
        if user_id:
            client = await scanner.get_user_client(user_id)
            logger.info(f"User-specific client for {user_id}: {'found' if client else 'not found'}")
        
        # Fall back to main client if no user client
        if not client:
            if not scanner.connected or not scanner.client:
                raise HTTPException(status_code=503, detail="Service not connected")
            client = scanner.client
            
            if not await client.is_user_authorized():
                raise HTTPException(status_code=401, detail="Authentication required. Please connect your Telegram account first using the 'Connect Telegram' button.")
        
        # Get channel entity
        channel = await client.get_entity(username)
        
        # Get recent messages for analysis
        messages = await client.get_messages(channel, limit=50)
        
        # Basic analysis that always works
        analysis = {
            'title': getattr(channel, 'title', username),
            'username': getattr(channel, 'username', username),
            'description': getattr(channel, 'about', ''),
            'member_count': getattr(channel, 'participants_count', 0),
            'verified': getattr(channel, 'verified', False),
            'scam': getattr(channel, 'scam', False),
            'fake': getattr(channel, 'fake', False),
            'message_count': len(messages),
            'recent_activity': [],
            'enhanced_data': False,
            'active_members': 0,
            'kol_count': 0,
            'kol_details': [],
            'admin_count': 0,
            'bot_count': 0
        }
        
        # Process recent messages
        for msg in messages[:10]:  # Last 10 messages
            if msg.message:
                analysis['recent_activity'].append({
                    'id': msg.id,
                    'date': msg.date.isoformat(),
                    'text': msg.message[:200] + '...' if len(msg.message) > 200 else msg.message,
                    'views': getattr(msg, 'views', 0),
                    'forwards': getattr(msg, 'forwards', 0)
                })
        
        # Enhanced analysis for public groups or groups where user is admin
        try:
            await enhance_channel_analysis(client, channel, analysis)
        except Exception as e:
            logger.warning(f"Could not fetch enhanced data for {username}: {str(e)}")
            # Continue with basic analysis
        
        logger.info(f"Channel scan completed for: {username}")
        return analysis
        
    except HTTPException:
        # Re-raise HTTPExceptions without modification
        raise
    except Exception as e:
        error_msg = str(e) if str(e) else f"Unknown error occurred while scanning {username}"
        logger.error(f"Error scanning channel {username}: {error_msg}")
        logger.error(f"Exception type: {type(e).__name__}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=error_msg)


async def enhance_channel_analysis(client: TelegramClient, channel, analysis: dict):
    """Enhanced analysis for public groups or groups where user is admin"""
    try:
        # Check if we can access participant information
        # This works for public groups or groups where the user is admin/member
        
        # Try to get full channel info first
        try:
            full_channel = await client(GetFullChannelRequest(channel))
            analysis['description'] = getattr(full_channel.full_chat, 'about', analysis['description'])
            total_participants = getattr(full_channel.full_chat, 'participants_count', analysis['member_count'])
            analysis['member_count'] = total_participants
        except Exception as e:
            logger.debug(f"Could not get full channel info: {e}")
        
        # Try to get participants (this requires appropriate permissions)
        participants = []
        admins = []
        bots = []
        active_users = set()
        
        # Get admins first
        try:
            admin_participants = await client(GetParticipantsRequest(
                channel=channel,
                filter=ChannelParticipantsAdmins(),
                offset=0,
                limit=100,
                hash=0
            ))
            
            for participant in admin_participants.participants:
                user_id = getattr(participant, 'user_id', None)
                if user_id:
                    try:
                        user = next(u for u in admin_participants.users if u.id == user_id)
                        admin_info = {
                            'user_id': user.id,
                            'username': getattr(user, 'username', None),
                            'first_name': getattr(user, 'first_name', ''),
                            'last_name': getattr(user, 'last_name', ''),
                            'is_admin': True,
                            'is_bot': getattr(user, 'bot', False),
                            'is_verified': getattr(user, 'verified', False)
                        }
                        admins.append(admin_info)
                        
                        if admin_info['is_bot']:
                            bots.append(admin_info)
                        else:
                            active_users.add(user_id)
                            
                    except StopIteration:
                        continue
                        
        except Exception as e:
            logger.debug(f"Could not get admin participants: {e}")
        
        # Try to get recent participants (active members)
        try:
            recent_participants = await client(GetParticipantsRequest(
                channel=channel,
                filter=ChannelParticipantsRecent(),
                offset=0,
                limit=200,  # Get more recent members to analyze activity
                hash=0
            ))
            
            for participant in recent_participants.participants:
                user_id = getattr(participant, 'user_id', None)
                if user_id:
                    try:
                        user = next(u for u in recent_participants.users if u.id == user_id)
                        if not getattr(user, 'bot', False):
                            active_users.add(user_id)
                        else:
                            bot_info = {
                                'user_id': user.id,
                                'username': getattr(user, 'username', None),
                                'first_name': getattr(user, 'first_name', ''),
                                'is_bot': True
                            }
                            bots.append(bot_info)
                            
                    except StopIteration:
                        continue
                        
        except Exception as e:
            logger.debug(f"Could not get recent participants: {e}")
        
        # Use advanced KOL detection system
        logger.info(f"Analyzing {len(admins)} admins and {len(active_users)} active users for KOL potential")
        
        # Combine admins and recent participants for analysis
        all_participants = admin_participants.participants if 'admin_participants' in locals() else []
        if 'recent_participants' in locals():
            all_participants.extend(recent_participants.participants)
        
        # Use advanced KOL detector to identify genuine KOLs
        genuine_kols = await kol_detector.analyze_potential_kols(client, channel, all_participants)
        
        # Convert to the expected format
        kols = []
        for kol_metrics in genuine_kols:
            kol_info = {
                'user_id': kol_metrics.user_id,
                'username': kol_metrics.username,
                'first_name': kol_metrics.first_name,
                'last_name': kol_metrics.last_name,
                'is_admin': kol_metrics.is_admin,
                'is_verified': kol_metrics.is_verified,
                'influence_score': kol_metrics.influence_score,
                'engagement_rate': kol_metrics.engagement_rate,
                'avg_views': kol_metrics.avg_views,
                'posting_frequency': kol_metrics.posting_frequency,
                'content_quality_score': kol_metrics.content_quality_score,
                'bot_probability': kol_metrics.bot_probability,
                'specialty_tags': kol_metrics.specialty_tags,
                'follower_count': kol_metrics.follower_count
            }
            kols.append(kol_info)
        
        logger.info(f"Identified {len(kols)} genuine KOLs using advanced criteria")
        
        # Update analysis with enhanced data
        analysis.update({
            'enhanced_data': True,
            'active_members': len(active_users),
            'admin_count': len(admins),
            'bot_count': len(bots),
            'kol_count': len(kols),
            'kol_details': kols
        })
        
        logger.info(f"Enhanced analysis completed: {len(active_users)} active members, {len(kols)} KOLs, {len(admins)} admins")
        
    except Exception as e:
        logger.warning(f"Enhanced analysis failed: {e}")
        # Don't raise the error, just continue with basic analysis
        pass


async def identify_kols_comprehensive(client: TelegramClient, channel, admins: list, active_users: set, analysis: dict) -> list:
    """
    Comprehensive KOL identification based on:
    1. Group dynamics and content flow
    2. Admin/leader status
    3. Engagement and community structure
    4. Crypto keyword and trading signal analysis
    5. Cross-platform presence indicators
    """
    try:
        kols = []
        user_engagement_scores = {}
        crypto_keywords = [
            'buy', 'sell', 'long', 'short', 'entry', 'exit', 'stop loss', 'target', 'tp', 'sl',
            'signal', 'call', 'trade', 'btc', 'eth', 'crypto', 'coin', 'token', 'pump', 'dump',
            'moon', 'dip', 'hodl', 'stake', 'yield', 'defi', 'nft', 'analysis', 'chart', 'ta'
        ]
        
        # Get recent messages for analysis (last 100 messages)
        try:
            messages = await client.get_messages(channel, limit=100)
            logger.info(f"Analyzing {len(messages)} messages for KOL identification")
            
            # Analyze message patterns and engagement
            for msg in messages:
                if not msg.message or not msg.from_id:
                    continue
                    
                user_id = getattr(msg.from_id, 'user_id', None)
                if not user_id:
                    continue
                
                # Initialize user engagement score
                if user_id not in user_engagement_scores:
                    user_engagement_scores[user_id] = {
                        'message_count': 0,
                        'crypto_signals': 0,
                        'engagement_received': 0,
                        'leadership_indicators': 0,
                        'wallet_mentions': 0,
                        'cross_platform_refs': 0,
                        'user_info': None
                    }
                
                score = user_engagement_scores[user_id]
                score['message_count'] += 1
                
                # Analyze message content for crypto signals and leadership
                msg_text = msg.message.lower()
                
                # Check for crypto trading signals
                if any(keyword in msg_text for keyword in crypto_keywords):
                    score['crypto_signals'] += 1
                
                # Check for leadership language patterns
                leadership_patterns = [
                    'my analysis', 'my call', 'follow me', 'subscribe', 'join my',
                    'my signal', 'my trade', 'recommendation', 'advice', 'strategy',
                    'portfolio', 'position', 'profit', 'loss', 'performance'
                ]
                if any(pattern in msg_text for pattern in leadership_patterns):
                    score['leadership_indicators'] += 1
                
                # Check for wallet addresses (basic crypto address pattern)
                import re
                wallet_patterns = [
                    r'0x[a-fA-F0-9]{40}',  # Ethereum
                    r'[13][a-km-zA-HJ-NP-Z1-9]{25,34}',  # Bitcoin
                    r'[A-Za-z0-9]{32,44}'  # General crypto address pattern
                ]
                for pattern in wallet_patterns:
                    if re.search(pattern, msg.message):
                        score['wallet_mentions'] += 1
                
                # Check for cross-platform references
                platform_refs = ['twitter', '@', 'discord', 'youtube', 'telegram', 'channel', 'group']
                if any(ref in msg_text for ref in platform_refs):
                    score['cross_platform_refs'] += 1
                
                # Count replies and engagement this message received
                if hasattr(msg, 'replies') and msg.replies:
                    score['engagement_received'] += getattr(msg.replies, 'replies', 0)
        
        except Exception as e:
            logger.warning(f"Could not analyze messages for KOL detection: {e}")
            messages = []
        
        # Get user information for high-scoring users
        potential_kols = {}
        for user_id, score_data in user_engagement_scores.items():
            # Calculate overall influence score
            influence_score = (
                score_data['message_count'] * 1 +
                score_data['crypto_signals'] * 3 +
                score_data['engagement_received'] * 2 +
                score_data['leadership_indicators'] * 4 +
                score_data['wallet_mentions'] * 2 +
                score_data['cross_platform_refs'] * 1
            )
            
            # Consider users with significant influence (top 10% or score > 10)
            if influence_score >= 10 or score_data['message_count'] >= 5:
                potential_kols[user_id] = {
                    'influence_score': influence_score,
                    'engagement_data': score_data
                }
        
        # Process admins first (higher priority for KOL status)
        for admin in admins:
            if admin['is_bot']:
                continue
                
            user_id = admin['user_id']
            engagement_data = user_engagement_scores.get(user_id, {})
            influence_score = potential_kols.get(user_id, {}).get('influence_score', 0)
            
            # Admins get bonus points for leadership
            admin_bonus = 15 if admin['is_verified'] else 10
            total_score = influence_score + admin_bonus
            
            kol_info = {
                'user_id': user_id,
                'username': admin['username'],
                'first_name': admin['first_name'],
                'last_name': admin['last_name'],
                'is_admin': True,
                'is_verified': admin['is_verified'],
                'kol_type': 'admin_leader',
                'influence_score': total_score,
                'message_count': engagement_data.get('message_count', 0),
                'crypto_signals': engagement_data.get('crypto_signals', 0),
                'leadership_indicators': engagement_data.get('leadership_indicators', 0),
                'engagement_received': engagement_data.get('engagement_received', 0),
                'wallet_mentions': engagement_data.get('wallet_mentions', 0),
                'cross_platform_refs': engagement_data.get('cross_platform_refs', 0)
            }
            
            # Only include if they show KOL characteristics
            if (total_score >= 15 or 
                admin['is_verified'] or 
                engagement_data.get('crypto_signals', 0) > 0 or
                engagement_data.get('leadership_indicators', 0) > 0):
                kols.append(kol_info)
        
        # Process non-admin potential KOLs
        try:
            all_participants = await client(GetParticipantsRequest(
                channel=channel,
                filter=ChannelParticipantsSearch(''),
                offset=0,
                limit=100,
                hash=0
            ))
            
            admin_ids = {admin['user_id'] for admin in admins}
            
            for user_id, kol_data in potential_kols.items():
                if user_id in admin_ids:  # Skip admins (already processed)
                    continue
                    
                if kol_data['influence_score'] < 20:  # Higher threshold for non-admins
                    continue
                
                # Find user info
                try:
                    user = next(u for u in all_participants.users if u.id == user_id)
                    engagement_data = kol_data['engagement_data']
                    
                    kol_info = {
                        'user_id': user_id,
                        'username': getattr(user, 'username', None),
                        'first_name': getattr(user, 'first_name', ''),
                        'last_name': getattr(user, 'last_name', ''),
                        'is_admin': False,
                        'is_verified': getattr(user, 'verified', False),
                        'kol_type': 'content_leader',
                        'influence_score': kol_data['influence_score'],
                        'message_count': engagement_data.get('message_count', 0),
                        'crypto_signals': engagement_data.get('crypto_signals', 0),
                        'leadership_indicators': engagement_data.get('leadership_indicators', 0),
                        'engagement_received': engagement_data.get('engagement_received', 0),
                        'wallet_mentions': engagement_data.get('wallet_mentions', 0),
                        'cross_platform_refs': engagement_data.get('cross_platform_refs', 0)
                    }
                    
                    kols.append(kol_info)
                    
                except StopIteration:
                    continue
                    
        except Exception as e:
            logger.debug(f"Could not get additional participants for KOL analysis: {e}")
        
        # Sort KOLs by influence score
        kols.sort(key=lambda x: x['influence_score'], reverse=True)
        
        # Log KOL detection results
        logger.info(f"Identified {len(kols)} KOLs with comprehensive analysis")
        for kol in kols[:3]:  # Log top 3 KOLs
            logger.info(f"KOL: @{kol['username']} - Score: {kol['influence_score']}, Type: {kol['kol_type']}")
        
        return kols[:10]  # Return top 10 KOLs
        
    except Exception as e:
        logger.error(f"Comprehensive KOL identification failed: {e}")
        return []

@app.get("/bot-detection/analyze/{username}")
async def analyze_user_bot_detection(username: str, user_id: str = None):
    try:
        logger.info(f"Analyzing user for bot detection: {username}")
        
        # Try to get user-specific client first
        client = None
        if user_id:
            client = await scanner.get_user_client(user_id)
        
        # Fall back to main client if no user client
        if not client:
            if not scanner.connected or not scanner.client:
                raise HTTPException(status_code=503, detail="Service not connected")
            client = scanner.client
            
            if not await client.is_user_authorized():
                raise HTTPException(status_code=401, detail="Not authorized. Please authenticate first.")
        
        # Get user entity
        user = await client.get_entity(username)
        
        # Basic bot detection analysis
        analysis = {
            'username': username,
            'is_bot': getattr(user, 'bot', False),
            'is_verified': getattr(user, 'verified', False),
            'is_scam': getattr(user, 'scam', False),
            'is_fake': getattr(user, 'fake', False),
            'first_name': getattr(user, 'first_name', ''),
            'last_name': getattr(user, 'last_name', ''),
            'phone': getattr(user, 'phone', ''),
            'bio': getattr(user, 'about', ''),
            'common_chats_count': getattr(user, 'common_chats_count', 0),
            'bot_probability': 0.0,
            'analysis_factors': []
        }
        
        # Calculate bot probability based on various factors
        bot_score = 0
        
        if analysis['is_bot']:
            bot_score += 100
            analysis['analysis_factors'].append("Marked as bot by Telegram")
        
        if analysis['is_scam']:
            bot_score += 80
            analysis['analysis_factors'].append("Marked as scam account")
        
        if analysis['is_fake']:
            bot_score += 70
            analysis['analysis_factors'].append("Marked as fake account")
        
        if not analysis['first_name'] and not analysis['last_name']:
            bot_score += 20
            analysis['analysis_factors'].append("No name set")
        
        if not analysis['bio']:
            bot_score += 10
            analysis['analysis_factors'].append("No bio/description")
        
        analysis['bot_probability'] = min(bot_score, 100) / 100
        
        logger.info(f"Bot detection completed for: {username}")
        return analysis
        
    except Exception as e:
        logger.error(f"Error analyzing user {username}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/user-session/{user_id}")
async def get_user_session(user_id: str):
    """Get user session status"""
    try:
        # Check if user has an active client
        client = await scanner.get_user_client(user_id)
        if client and await client.is_user_authorized():
            # Get user info
            me = await client.get_me()
            user_info = {
                'id': str(me.id),
                'first_name': me.first_name or '',
                'last_name': me.last_name or '',
                'username': me.username or '',
                'is_verified': me.verified or False,
                'session_id': f"active_{user_id}_{datetime.now().timestamp()}"
            }
            return {
                'success': True,
                'user_info': user_info,
                'session_id': f"active_{user_id}"
            }
        else:
            return {
                'success': False,
                'message': 'No active session'
            }
    except Exception as e:
        logger.error(f"Error checking user session {user_id}: {e}")
        return {
            'success': False,
            'message': 'Session check failed'
        }

@app.delete("/user-session/{user_id}")
async def delete_user_session(user_id: str):
    """Delete user session (logout)"""
    try:
        client = await scanner.get_user_client(user_id)
        if client:
            await client.disconnect()
            # Remove from user_clients
            if user_id in scanner.user_clients:
                del scanner.user_clients[user_id]
        
        return {
            'success': True,
            'message': 'Session deleted successfully'
        }
    except Exception as e:
        logger.error(f"Error deleting user session {user_id}: {e}")
        return {
            'success': False,
            'message': 'Failed to delete session'
        }

if __name__ == "__main__":
    logger.info("Starting FastAPI server...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=PORT,
        log_level="info"
    ) 