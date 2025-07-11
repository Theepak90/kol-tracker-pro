from telethon import TelegramClient
import os
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

# Telegram client configuration
API_ID = int(os.getenv('API_ID', 0))
API_HASH = os.getenv('API_HASH', '')
SESSION_NAME = os.getenv('SESSION_NAME', 'telegram_session')

logger.info(f"API_ID: {API_ID}")
logger.info(f"API_HASH: {'set' if API_HASH else 'not set'}")
logger.info(f"SESSION_NAME: {SESSION_NAME}")

if not API_ID or not API_HASH:
    logger.error("API_ID and API_HASH must be set in .env file")
    raise ValueError("API_ID and API_HASH must be set in .env file")

async def main():
    client = TelegramClient(SESSION_NAME, API_ID, API_HASH)
    await client.connect()
    
    if await client.is_user_authorized():
        logger.info("Already authorized")
    else:
        logger.info("Please check your phone for the Telegram code")
        phone = input("Enter your phone number (including country code): ")
        await client.send_code_request(phone)
        code = input("Enter the code you received: ")
        await client.sign_in(phone, code)
        logger.info("Successfully authorized")
    
    await client.disconnect()

if __name__ == "__main__":
    import asyncio
    asyncio.run(main()) 