#!/usr/bin/env python3
"""
Fix Telegram Authentication and Database Lock Issues
"""

import os
import sqlite3
import asyncio
from telethon import TelegramClient
from telethon.errors import SessionPasswordNeededError
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
API_ID = 28152923
API_HASH = '766760d2838474a5e6dd734d785aa7ad'
SESSION_NAME = 'telegram_session'

async def fix_database_lock():
    """Fix SQLite database lock issues"""
    session_file = f"{SESSION_NAME}.session"
    
    if os.path.exists(session_file):
        logger.info("🔧 Fixing database lock issues...")
        
        # Close any existing connections
        try:
            # Create a new connection to unlock the database
            conn = sqlite3.connect(session_file)
            
            # Enable WAL mode and then switch back to DELETE mode
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute("PRAGMA journal_mode=DELETE;")
            
            # Vacuum the database to clean up
            conn.execute("VACUUM;")
            
            # Commit and close
            conn.commit()
            conn.close()
            
            logger.info("✅ Database lock issues fixed")
            
        except Exception as e:
            logger.error(f"❌ Error fixing database: {e}")
            
            # If all else fails, backup and recreate
            backup_file = f"{session_file}.backup"
            if os.path.exists(backup_file):
                os.remove(backup_file)
            
            os.rename(session_file, backup_file)
            logger.info("🔄 Session file backed up, will recreate")

async def setup_telegram_auth():
    """Set up Telegram authentication"""
    logger.info("🔐 Setting up Telegram authentication...")
    
    # Fix database lock first
    await fix_database_lock()
    
    # Create client
    client = TelegramClient(SESSION_NAME, API_ID, API_HASH)
    
    try:
        # Start the client
        await client.start()
        
        # Check if we're authorized
        if await client.is_user_authorized():
            logger.info("✅ Already authorized!")
            me = await client.get_me()
            logger.info(f"👤 Logged in as: {me.first_name} {me.last_name or ''} (@{me.username or 'No username'})")
        else:
            logger.info("❌ Not authorized, need to authenticate")
            
            # Get phone number
            phone = input("📱 Enter your phone number (with country code, e.g., +1234567890): ")
            
            # Send code request
            await client.send_code_request(phone)
            
            # Get verification code
            code = input("🔢 Enter the verification code: ")
            
            try:
                # Sign in with code
                await client.sign_in(phone, code)
                logger.info("✅ Successfully authenticated!")
                
            except SessionPasswordNeededError:
                # Two-factor authentication enabled
                password = input("🔒 Two-factor authentication enabled. Enter your password: ")
                await client.sign_in(password=password)
                logger.info("✅ Successfully authenticated with 2FA!")
                
        # Test the connection
        me = await client.get_me()
        logger.info(f"🎉 Authentication successful! Welcome {me.first_name}!")
        
    except Exception as e:
        logger.error(f"❌ Authentication failed: {e}")
        return False
        
    finally:
        await client.disconnect()
        
    return True

async def test_connection():
    """Test the Telegram connection"""
    logger.info("🧪 Testing Telegram connection...")
    
    client = TelegramClient(SESSION_NAME, API_ID, API_HASH)
    
    try:
        await client.start()
        
        if await client.is_user_authorized():
            me = await client.get_me()
            logger.info(f"✅ Connection test successful! User: {me.first_name}")
            
            # Test getting dialogs
            dialogs = await client.get_dialogs(limit=5)
            logger.info(f"📁 Found {len(dialogs)} recent chats")
            
            return True
        else:
            logger.error("❌ Not authorized")
            return False
            
    except Exception as e:
        logger.error(f"❌ Connection test failed: {e}")
        return False
        
    finally:
        await client.disconnect()

async def main():
    """Main function"""
    logger.info("🚀 Telegram Authentication Fix Script")
    logger.info("=" * 40)
    
    # Step 1: Fix database lock
    await fix_database_lock()
    
    # Step 2: Test existing connection
    if await test_connection():
        logger.info("✅ Telegram authentication is working!")
        return
    
    # Step 3: Set up authentication
    if await setup_telegram_auth():
        logger.info("✅ Telegram authentication setup complete!")
        
        # Step 4: Final test
        if await test_connection():
            logger.info("🎉 All tests passed! Telegram is ready to use.")
        else:
            logger.error("❌ Final test failed. Please check your setup.")
    else:
        logger.error("❌ Authentication setup failed.")

if __name__ == "__main__":
    asyncio.run(main()) 