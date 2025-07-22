#!/usr/bin/env python3
import os
import sys
import logging
import asyncio
from main import app, scanner
import uvicorn

# Configure logging for production
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def setup_production_environment():
    """Set up production environment variables and configuration"""
    
    # Set default values for production
    os.environ.setdefault('PORT', '10000')
    os.environ.setdefault('HOST', '0.0.0.0')
    os.environ.setdefault('SESSION_NAME', 'telegram_session')
    
    # Log environment configuration (without sensitive data)
    logger.info("🚀 Starting KOL Tracker Telethon Service on Render...")
    logger.info(f"Environment: {os.getenv('NODE_ENV', 'production')}")
    logger.info(f"Port: {os.getenv('PORT')}")
    logger.info(f"Host: {os.getenv('HOST')}")
    logger.info(f"API_ID: {'Set ✅' if os.getenv('API_ID') else 'Missing ❌'}")
    logger.info(f"API_HASH: {'Set ✅' if os.getenv('API_HASH') else 'Missing ❌'}")
    logger.info(f"Database URL: {'Set ✅' if os.getenv('DATABASE_URL') else 'Missing ❌'}")
    logger.info(f"Session Name: {os.getenv('SESSION_NAME')}")

async def startup_service():
    """Initialize the service"""
    try:
        logger.info("🔄 Initializing Telethon scanner...")
        await scanner.connect()
        logger.info("✅ Telethon service initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize service: {e}")
        # Don't exit - allow service to start for user authentication
        logger.info("⚠️ Continuing startup in authentication mode")

def main():
    """Main entry point for Render deployment"""
    
    setup_production_environment()
    
    # Get configuration from environment
    port = int(os.getenv('PORT', 10000))
    host = os.getenv('HOST', '0.0.0.0')
    
    # Add startup event to initialize scanner
    @app.on_event("startup")
    async def startup():
        await startup_service()
    
    logger.info(f"🎯 Starting server on {host}:{port}")
    
    # Start the FastAPI server
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        log_level="info",
        access_log=True,
        reload=False,  # Disable reload in production
        workers=1      # Single worker for free tier
    )

if __name__ == "__main__":
    main() 