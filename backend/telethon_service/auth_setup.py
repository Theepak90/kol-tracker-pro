#!/usr/bin/env python3
"""
Authentication setup script for Telethon service.
Run this script once to authenticate with Telegram.
"""

import os
import asyncio
from telethon import TelegramClient
from telethon.errors import SessionPasswordNeededError

# Configuration - Use the working credentials from env.example
API_ID = int(os.getenv('API_ID', '28152923'))
API_HASH = os.getenv('API_HASH', '766760d2838474a5e6dd734d785aa7ad')
SESSION_NAME = os.getenv('SESSION_NAME', 'telegram_session')

async def authenticate():
    """Authenticate with Telegram."""
    print("=== Telegram Authentication Setup ===")
    print("This script will help you authenticate with Telegram.")
    print("You'll need to provide your phone number and verification code.")
    print()
    print(f"Starting authentication for session: {SESSION_NAME}")
    
    # Create client
    client = TelegramClient(SESSION_NAME, API_ID, API_HASH)
    
    try:
        await client.connect()
        
        if await client.is_user_authorized():
            print("✅ Already authenticated!")
            me = await client.get_me()
            print(f"Logged in as: {me.first_name} {me.last_name or ''} (@{me.username or 'no username'})")
            return True
            
        print("❌ Not authenticated. Starting authentication process...")
        
        # Request phone number
        phone = input("Enter your phone number (with country code, e.g., +1234567890): ")
        await client.send_code_request(phone)
        
        # Request verification code
        code = input("Enter the verification code you received: ")
        
        try:
            await client.sign_in(phone, code)
        except SessionPasswordNeededError:
            # 2FA is enabled
            password = input("Enter your 2FA password: ")
            await client.sign_in(password=password)
        
        # Verify authentication
        if await client.is_user_authorized():
            me = await client.get_me()
            print("✅ Authentication successful!")
            print(f"Logged in as: {me.first_name} {me.last_name or ''} (@{me.username or 'no username'})")
            return True
        else:
            print("❌ Authentication failed")
            return False
            
    except Exception as e:
        print(f"❌ Authentication failed: {str(e)}")
        return False
    finally:
        await client.disconnect()

async def main():
    """Main function."""
    success = await authenticate()
    if success:
        print("\n🎉 You can now start the Telethon service with: python3 main.py")
    else:
        print("\n❌ Authentication failed. Please try again.")

if __name__ == "__main__":
    asyncio.run(main()) 