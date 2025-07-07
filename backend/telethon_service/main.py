from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from telethon import TelegramClient
from telethon.tl.functions.channels import GetFullChannelRequest
from telethon.tl.types import Channel, User, InputChannel, Message, PeerUser, PeerChannel
from telethon.tl.functions.messages import GetHistoryRequest
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from typing import List, Optional, Dict, cast, Union
import asyncio
import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from datetime import datetime, timedelta
from schemas.group_scan import GroupScan, KOLInfo

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

class VolumeData(BaseModel):
    timestamp: datetime
    volume: float
    price: float
    token_address: Optional[str]
    chain: Optional[str]

class EnhancedUserPost(BaseModel):
    message_id: int
    text: str
    date: datetime
    views: Optional[int]
    forwards: Optional[int]
    channel_id: Optional[int]
    channel_title: Optional[str]
    volume_data: Optional[VolumeData]
    sentiment_score: Optional[float]
    engagement_rate: Optional[float]

class EnhancedUserPostsResponse(BaseModel):
    username: str
    posts: List[EnhancedUserPost]
    total_posts: int
    total_views: int
    total_forwards: int
    total_volume: float
    average_sentiment: float
    peak_engagement: float

class TelegramScanner:
    def __init__(self):
        self.client = None
        self.db = None
        self.mongo_client = None
        
        # Telegram client configuration
        self.api_id = int(os.getenv('API_ID', 0))
        self.api_hash = os.getenv('API_HASH', '')
        self.session_name = os.getenv('SESSION_NAME', 'telegram_session')
        
        # MongoDB configuration
        self.mongodb_url = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
        
        logger.info(f"API_ID: {self.api_id}")
        logger.info(f"API_HASH: {'set' if self.api_hash else 'not set'}")
        logger.info(f"SESSION_NAME: {self.session_name}")
        logger.info(f"MONGODB_URI: {'set' if self.mongodb_url != 'mongodb://localhost:27017' else 'using default'}")
        
        if not self.api_id or not self.api_hash:
            logger.error("API_ID and API_HASH must be set in .env file")
            raise ValueError("API_ID and API_HASH must be set in .env file")
    
    async def connect(self):
        try:
            # Connect to MongoDB
            logger.info("Connecting to MongoDB...")
            self.mongo_client = AsyncIOMotorClient(self.mongodb_url)
            self.db = self.mongo_client.telegram_scanner
            await self.db.command("ping")
            logger.info("Connected to MongoDB successfully")
            
            # Connect to Telegram
            logger.info("Creating Telegram client...")
            self.client = TelegramClient(self.session_name, self.api_id, self.api_hash)
            logger.info("Starting Telegram client...")
            await self.client.connect()
            
            if not await self.client.is_user_authorized():
                logger.error("User not authorized. Please run the authentication script first.")
                raise Exception("User not authorized")
                
            logger.info("Telegram client started successfully")
        except Exception as e:
            logger.error(f"Failed to start services: {str(e)}")
            raise
    
    async def disconnect(self):
        if self.client:
            await self.client.disconnect()
        if self.mongo_client:
            self.mongo_client.close()

scanner = TelegramScanner()
app = FastAPI()

class ChannelInfo(BaseModel):
    id: int
    title: str
    username: Optional[str]
    description: Optional[str]
    member_count: Optional[int]
    active_members: Optional[int]
    bot_count: Optional[int]
    kol_count: Optional[int]
    kol_details: List[KOLInfo]
    previous_scans: Optional[List[GroupScan]]

class UserPost(BaseModel):
    message_id: int
    text: str
    date: datetime
    views: Optional[int]
    forwards: Optional[int]
    channel_id: Optional[int]
    channel_title: Optional[str]

class UserPostsResponse(BaseModel):
    username: str
    posts: List[UserPost]
    total_posts: int
    total_views: int
    total_forwards: int

# Configure CORS with updated origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
        "http://localhost:5179",
        "http://localhost:3000",
        "http://localhost:4173",
        "https://kol-tracker-pro.vercel.app",
        "https://kolnexus.vercel.app",
        "https://*.vercel.app",
        "https://kolnexus-backend.onrender.com",
        "https://kolnexus-telethon.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await scanner.connect()

@app.on_event("shutdown")
async def shutdown_event():
    await scanner.disconnect()

@app.get("/health")
async def health_check():
    if not scanner.client or not scanner.client.is_connected():
        raise HTTPException(status_code=503, detail="Telegram client not connected")
    if scanner.db is None:
        raise HTTPException(status_code=503, detail="MongoDB not connected")
    return {"status": "ok"}

@app.get("/scan/{channel_username}")
async def scan_channel(channel_username: str):
    if not scanner.client or not scanner.client.is_connected():
        raise HTTPException(status_code=503, detail="Telegram client not connected")
    if scanner.db is None:
        raise HTTPException(status_code=503, detail="MongoDB not connected")
        
    try:
        logger.info(f"Scanning channel: {channel_username}")
        # Get channel entity
        channel = await scanner.client.get_entity(channel_username)
        
        if not isinstance(channel, Channel):
            raise HTTPException(status_code=400, detail="Not a valid channel")
        
        # Get full channel info
        if not channel.access_hash:
            raise HTTPException(status_code=400, detail="Cannot access channel: missing access hash")
            
        input_channel = InputChannel(channel.id, channel.access_hash)
        full_channel = await scanner.client(GetFullChannelRequest(channel=input_channel))
        
        # Get all participants with their online status
        participants = await scanner.client.get_participants(channel, aggressive=True)
        
        # Get recent messages to analyze activity
        messages = await scanner.client.get_messages(channel, limit=100)
        recent_active_users = set()
        
        # Get users who recently sent messages
        for msg in messages:
            if msg.sender_id:
                recent_active_users.add(msg.sender_id)
        
        # Count bots and KOLs
        bot_count = 0
        kol_count = 0
        active_members = len(recent_active_users)  # Start with recently active users
        kol_details = []
        
        for participant in participants:
            if isinstance(participant, User):
                # Count bots
                if participant.bot:
                    bot_count += 1
                    continue  # Skip bots from other counts
                
                # Count active members
                if (participant.id not in recent_active_users and  # Don't double count
                    (getattr(participant, 'status', None) or  # Has online status
                     (participant.photo and participant.username))):  # Has profile setup
                    active_members += 1
                
                # Count KOLs and collect their details
                if (participant.username and 
                    participant.photo and
                    (participant.id in recent_active_users or 
                     getattr(participant, 'admin_rights', None))):
                    kol_count += 1
                    kol_details.append(KOLInfo(
                        user_id=participant.id,
                        username=participant.username,
                        first_name=participant.first_name,
                        last_name=participant.last_name,
                        is_admin=bool(getattr(participant, 'admin_rights', None))
                    ))
        
        # Get previous scans
        previous_scans_cursor = scanner.db.group_scans.find({"username": channel_username}).sort("scanned_at", -1).limit(5)
        previous_scans = await previous_scans_cursor.to_list(length=5)
        
        channel_info = ChannelInfo(
            id=channel.id,
            title=channel.title,
            username=channel.username,
            description=full_channel.full_chat.about,
            member_count=full_channel.full_chat.participants_count,
            active_members=active_members,
            bot_count=bot_count,
            kol_count=kol_count,
            kol_details=kol_details,
            previous_scans=[GroupScan(**scan) for scan in previous_scans] if previous_scans else None
        )
        
        # Save scan results to MongoDB
        scan_record = GroupScan(
            channel_id=channel_info.id,
            title=channel_info.title,
            username=channel_info.username,
            description=channel_info.description,
            member_count=channel_info.member_count,
            active_members=channel_info.active_members,
            bot_count=channel_info.bot_count,
            kol_count=channel_info.kol_count,
            kol_details=channel_info.kol_details,
            scanned_at=datetime.utcnow()
        )
        
        await scanner.db.group_scans.insert_one(scan_record.dict())
        logger.info(f"Saved scan results to database for channel: {channel_username}")
        
        logger.info(f"Successfully scanned channel: {channel_username}")
        logger.info(f"Stats: active={active_members}, bots={bot_count}, kols={kol_count}, total={channel_info.member_count}")
        return channel_info
        
    except Exception as e:
        logger.error(f"Error scanning channel {channel_username}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scan-history/{channel_username}", response_model=List[GroupScan])
async def get_scan_history(channel_username: str):
    if scanner.db is None:
        raise HTTPException(status_code=503, detail="MongoDB not connected")
    try:
        cursor = scanner.db.group_scans.find({"username": channel_username}).sort("scanned_at", -1)
        scans = await cursor.to_list(length=100)
        return [GroupScan(**scan) for scan in scans]
    except Exception as e:
        logger.error(f"Error fetching scan history for {channel_username}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/track-posts/{username}", response_model=UserPostsResponse)
async def track_user_posts(username: str):
    if not scanner.client or not scanner.client.is_connected():
        raise HTTPException(status_code=503, detail="Telegram client not connected")
        
    try:
        logger.info(f"Tracking posts for user: {username}")
        
        # Clean username
        username = username.replace('@', '')
        
        # Get user entity
        try:
            user = await scanner.client.get_entity(username)
            if not isinstance(user, User):
                raise HTTPException(status_code=400, detail="Not a valid user")
        except ValueError:
            raise HTTPException(status_code=404, detail="User not found")
            
        # Get user's messages from all their dialogs
        posts = []
        total_views = 0
        total_forwards = 0
        
        async for dialog in scanner.client.iter_dialogs():
            try:
                if isinstance(dialog.entity, Channel):
                    # Get messages from this channel
                    messages = await scanner.client.get_messages(
                        dialog.entity,
                        limit=100,  # Increase limit to get more messages
                        from_user=user.id  # Only get messages from this user
                    )
                    
                    for msg in messages:
                        if msg.text:  # Only include messages with text
                            post = UserPost(
                                message_id=msg.id,
                                text=msg.text,
                                date=msg.date,
                                views=getattr(msg, 'views', 0),
                                forwards=getattr(msg, 'forwards', 0),
                                channel_id=dialog.entity.id,
                                channel_title=dialog.entity.title
                            )
                            posts.append(post)
                            total_views += post.views if post.views else 0
                            total_forwards += post.forwards if post.forwards else 0
                            
            except Exception as e:
                logger.warning(f"Failed to get messages from dialog: {str(e)}")
                continue
        
        # Sort posts by date
        posts.sort(key=lambda x: x.date, reverse=True)
        
        # Limit to most recent 50 posts
        posts = posts[:50]
        
        return UserPostsResponse(
            username=username,
            posts=posts,
            total_posts=len(posts),
            total_views=total_views,
            total_forwards=total_forwards
        )
        
    except Exception as e:
        logger.error(f"Error tracking posts for {username}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/track-volume/{username}", response_model=Dict[str, List[VolumeData]])
async def track_user_volume(username: str, days: int = 30):
    if not scanner.client or not scanner.client.is_connected():
        raise HTTPException(status_code=503, detail="Telegram client not connected")
    
    try:
        # Get user's posts
        user = await scanner.client.get_entity(username)
        messages = await scanner.client.get_messages(user, limit=100)
        
        # Extract token addresses and trading volumes
        volume_data: Dict[str, List[VolumeData]] = {}
        
        for msg in messages:
            # Extract token addresses using regex
            token_addresses = extract_token_addresses(msg.text) if msg.text else []
            
            for token in token_addresses:
                if token not in volume_data:
                    volume_data[token] = []
                
                # Get volume data from your preferred source (e.g., DEX API)
                volume = await get_token_volume(token)
                
                volume_data[token].append(VolumeData(
                    timestamp=msg.date,
                    volume=volume.get('volume', 0),
                    price=volume.get('price', 0),
                    token_address=token,
                    chain=volume.get('chain', 'ethereum')
                ))
        
        return volume_data
    except Exception as e:
        logger.error(f"Error tracking volume for {username}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/enhanced-posts/{username}", response_model=EnhancedUserPostsResponse)
async def get_enhanced_posts(username: str):
    if not scanner.client or not scanner.client.is_connected():
        raise HTTPException(status_code=503, detail="Telegram client not connected")
    
    try:
        # Get user's posts with enhanced data
        user = await scanner.client.get_entity(username)
        messages = await scanner.client.get_messages(user, limit=100)
        
        enhanced_posts = []
        total_volume = 0
        total_sentiment = 0
        max_engagement = 0
        
        for msg in messages:
            # Get volume data
            volume_data = await get_post_volume_data(msg.text) if msg.text else None
            
            # Calculate sentiment score
            sentiment = calculate_sentiment(msg.text) if msg.text else 0
            
            # Calculate engagement rate
            engagement = calculate_engagement_rate(msg.views, msg.forwards)
            
            if volume_data:
                total_volume += volume_data.volume
            
            total_sentiment += sentiment
            max_engagement = max(max_engagement, engagement)
            
            enhanced_posts.append(EnhancedUserPost(
                message_id=msg.id,
                text=msg.text or "",
                date=msg.date,
                views=msg.views,
                forwards=getattr(msg, 'forwards', 0),
                channel_id=msg.peer_id.channel_id if isinstance(msg.peer_id, PeerChannel) else None,
                channel_title=getattr(msg, 'chat', None) and getattr(msg.chat, 'title', None),
                volume_data=volume_data,
                sentiment_score=sentiment,
                engagement_rate=engagement
            ))
        
        return EnhancedUserPostsResponse(
            username=username,
            posts=enhanced_posts,
            total_posts=len(enhanced_posts),
            total_views=sum(p.views or 0 for p in enhanced_posts),
            total_forwards=sum(p.forwards or 0 for p in enhanced_posts),
            total_volume=total_volume,
            average_sentiment=total_sentiment / len(enhanced_posts) if enhanced_posts else 0,
            peak_engagement=max_engagement
        )
    except Exception as e:
        logger.error(f"Error getting enhanced posts for {username}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions
def extract_token_addresses(text: str) -> List[str]:
    # Implement regex pattern to extract token addresses
    # This is a basic implementation - enhance based on your needs
    import re
    pattern = r'0x[a-fA-F0-9]{40}'
    return re.findall(pattern, text)

async def get_token_volume(token_address: str) -> Dict:
    # Implement API call to get token volume data
    # This is a placeholder - implement actual API call
    return {
        'volume': 0,
        'price': 0,
        'chain': 'ethereum'
    }

async def get_post_volume_data(text: str) -> Optional[VolumeData]:
    # Extract token address and get volume data
    addresses = extract_token_addresses(text)
    if not addresses:
        return None
    
    volume_data = await get_token_volume(addresses[0])
    return VolumeData(
        timestamp=datetime.now(),
        volume=volume_data['volume'],
        price=volume_data['price'],
        token_address=addresses[0],
        chain=volume_data['chain']
    )

def calculate_sentiment(text: str) -> float:
    # Implement sentiment analysis
    # This is a placeholder - implement actual sentiment analysis
    return 0.0

def calculate_engagement_rate(views: Optional[int], forwards: Optional[int]) -> float:
    if not views:
        return 0.0
    return ((forwards or 0) / views) * 100

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info") 