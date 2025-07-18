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
from telethon.tl.types import PeerChannel, InputPeerChannel
from telethon.sessions import StringSession
import motor.motor_asyncio
import uvicorn

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
                logger.warning("Main client not authorized. User authentication will be handled per-session.")
            else:
                logger.info("Main Telegram client started successfully")
                
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
        return self.user_clients.get(user_id)
    
    async def store_user_client(self, user_id: str, client: TelegramClient):
        """Store user client for reuse"""
        self.user_clients[user_id] = client
    
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
        
        # Fall back to main client if no user client
        if not client:
            if not scanner.connected or not scanner.client:
                raise HTTPException(status_code=503, detail="Service not connected")
            client = scanner.client
            
            if not await client.is_user_authorized():
                raise HTTPException(status_code=401, detail="Not authorized. Please authenticate first.")
        
        # Get channel entity
        channel = await client.get_entity(username)
        
        # Get recent messages for analysis
        messages = await client.get_messages(channel, limit=50)
        
        # Analyze channel
        analysis = {
            'title': getattr(channel, 'title', username),
            'username': getattr(channel, 'username', username),
            'description': getattr(channel, 'about', ''),
            'member_count': getattr(channel, 'participants_count', 0),
            'verified': getattr(channel, 'verified', False),
            'scam': getattr(channel, 'scam', False),
            'fake': getattr(channel, 'fake', False),
            'message_count': len(messages),
            'recent_activity': []
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
        
        logger.info(f"Channel scan completed for: {username}")
        return analysis
        
    except Exception as e:
        logger.error(f"Error scanning channel {username}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

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

if __name__ == "__main__":
    logger.info("Starting FastAPI server...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=PORT,
        log_level="info"
    ) 