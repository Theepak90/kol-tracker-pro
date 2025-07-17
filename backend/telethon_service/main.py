import os
import asyncio
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from telethon import TelegramClient, events
from telethon.errors import SessionPasswordNeededError
from telethon.tl.functions.messages import GetHistoryRequest
from telethon.tl.types import PeerChannel, InputPeerChannel
import motor.motor_asyncio
from datetime import datetime, timedelta
import uvicorn
from typing import Optional, List, Dict, Any
import json
import traceback

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
logger.info(f"MONGODB_URI: {'using default' if MONGODB_URI == 'mongodb://localhost:27017' else 'configured'}")
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

class TelegramScanner:
    def __init__(self):
        self.client = None
        self.db = None
        self.connected = False
        
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
                logger.error("User not authorized. Please run the authentication script first.")
                raise Exception("User not authorized")
            
            logger.info("Telegram client started successfully")
            self.connected = True
            
        except Exception as e:
            logger.error(f"Failed to start services: {e}")
            raise e
    
    async def disconnect(self):
        if self.client:
            await self.client.disconnect()
        self.connected = False
    
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

@app.get("/bot-detection/analyze/{username}")
async def analyze_user_bot_detection(username: str):
    try:
        if not scanner.connected:
            raise HTTPException(status_code=503, detail="Service not connected")
            
        # Get user entity
        user = await scanner.client.get_entity(username)
        
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
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error analyzing user: {e}")
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    logger.info("Starting FastAPI server...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=PORT,
        log_level="info"
    ) 