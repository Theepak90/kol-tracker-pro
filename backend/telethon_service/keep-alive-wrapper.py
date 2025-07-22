#!/usr/bin/env python3

"""
Keep-Alive Wrapper for KOL Tracker Telethon Service
Ensures the Telethon service stays running on Render with auto-restart on failures
"""

import asyncio
import subprocess
import signal
import time
import os
import sys
import logging
import aiohttp
from datetime import datetime, timedelta

# Configuration
HEALTH_CHECK_INTERVAL = int(os.getenv('HEALTH_CHECK_INTERVAL', '300'))  # 5 minutes
RESTART_DELAY = 5  # 5 seconds
MAX_RESTART_ATTEMPTS = 10
RESTART_WINDOW = 3600  # 1 hour

restart_count = 0
last_restart_time = 0
telethon_process = None
is_shutting_down = False

# Set up logging with colors
class ColoredFormatter(logging.Formatter):
    COLORS = {
        'DEBUG': '\033[36m',    # Cyan
        'INFO': '\033[32m',     # Green
        'WARNING': '\033[33m',  # Yellow
        'ERROR': '\033[31m',    # Red
        'CRITICAL': '\033[35m', # Magenta
    }
    RESET = '\033[0m'

    def format(self, record):
        log_color = self.COLORS.get(record.levelname, self.RESET)
        record.levelname = f"{log_color}{record.levelname}{self.RESET}"
        record.msg = f"{log_color}{record.msg}{self.RESET}"
        return super().format(record)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Apply colored formatter
handler = logging.StreamHandler()
handler.setFormatter(ColoredFormatter('[%(asctime)s] %(levelname)s: %(message)s'))
logger.handlers = [handler]

async def start_telethon():
    """Start the Telethon service"""
    global telethon_process, is_shutting_down
    
    if is_shutting_down:
        return

    logger.info("🚀 Starting KOL Tracker Telethon Service...")

    try:
        telethon_process = await asyncio.create_subprocess_exec(
            'python', 'main.py',
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
            env=os.environ.copy()
        )

        # Monitor process output
        asyncio.create_task(monitor_process_output())
        
        # Wait for process and handle exit
        exit_code = await telethon_process.wait()
        
        if is_shutting_down:
            logger.info("🛑 Telethon shutdown complete")
            return

        if exit_code == 0:
            logger.info("✅ Telethon exited gracefully")
        else:
            logger.error(f"💥 Telethon exited with code {exit_code}")
            await restart_telethon()

    except Exception as error:
        logger.error(f"❌ Telethon process error: {error}")
        await restart_telethon()

async def monitor_process_output():
    """Monitor and log Telethon process output"""
    global telethon_process
    
    if not telethon_process or not telethon_process.stdout:
        return

    try:
        async for line in telethon_process.stdout:
            line_str = line.decode('utf-8').strip()
            if line_str:
                # Forward Telethon logs with prefix
                logger.info(f"📡 Telethon: {line_str}")
    except Exception as e:
        logger.warning(f"Error reading process output: {e}")

async def restart_telethon():
    """Restart the Telethon service with backoff and limits"""
    global restart_count, last_restart_time, telethon_process, is_shutting_down

    if is_shutting_down:
        return

    current_time = time.time()
    
    # Reset restart count if enough time has passed
    if current_time - last_restart_time > RESTART_WINDOW:
        restart_count = 0

    restart_count += 1
    last_restart_time = current_time

    if restart_count > MAX_RESTART_ATTEMPTS:
        logger.error(f"🚨 Maximum restart attempts ({MAX_RESTART_ATTEMPTS}) reached within 1 hour. Stopping.")
        sys.exit(1)

    logger.warning(f"🔄 Restarting Telethon (attempt {restart_count}/{MAX_RESTART_ATTEMPTS})...")

    # Kill existing process if still running
    if telethon_process and telethon_process.returncode is None:
        try:
            telethon_process.terminate()
            await asyncio.wait_for(telethon_process.wait(), timeout=10)
        except asyncio.TimeoutError:
            logger.warning("💀 Force killing Telethon process...")
            telethon_process.kill()
            await telethon_process.wait()

    # Wait before restarting
    await asyncio.sleep(RESTART_DELAY)
    
    # Start new process
    await start_telethon()

async def perform_health_check():
    """Perform health check on Telethon service"""
    try:
        port = os.getenv('PORT', '8000')
        url = f"http://localhost:{port}/health"
        
        timeout = aiohttp.ClientTimeout(total=10)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(url) as response:
                if response.status == 200:
                    return True
                else:
                    logger.warning(f"⚠️  Health check failed with status: {response.status}")
                    return False
                    
    except Exception as error:
        logger.warning(f"⚠️  Health check error: {error}")
        return False

async def health_check_loop():
    """Run periodic health checks"""
    logger.info(f"🏥 Health check started (interval: {HEALTH_CHECK_INTERVAL}s)")
    
    # Wait for service to start up
    await asyncio.sleep(30)
    
    while not is_shutting_down:
        logger.info("🏥 Performing health check...")
        
        is_healthy = await perform_health_check()
        
        if is_healthy:
            logger.info("✅ Health check passed")
        else:
            logger.error("❌ Health check failed - restarting Telethon")
            await restart_telethon()
            break  # Exit loop as restart will create new health check
            
        await asyncio.sleep(HEALTH_CHECK_INTERVAL)

async def keep_alive_ping():
    """Send keep-alive pings to prevent service sleeping"""
    if os.getenv('KEEP_ALIVE') != 'true':
        return

    logger.info("📍 Keep-alive ping started (14 minute intervals)")
    
    while not is_shutting_down:
        await asyncio.sleep(840)  # 14 minutes
        
        if is_shutting_down:
            break
            
        try:
            port = os.getenv('PORT', '8000')
            url = f"http://localhost:{port}/health"
            
            timeout = aiohttp.ClientTimeout(total=5)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.get(url) as response:
                    logger.info("📍 Keep-alive ping sent")
        except Exception as error:
            logger.warning(f"Keep-alive ping failed: {error}")

async def graceful_shutdown(signum):
    """Handle graceful shutdown"""
    global is_shutting_down, telethon_process
    
    logger.warning(f"🛑 Received signal {signum}. Starting graceful shutdown...")
    is_shutting_down = True

    if telethon_process and telethon_process.returncode is None:
        logger.warning("🛑 Stopping Telethon process...")
        try:
            telethon_process.terminate()
            await asyncio.wait_for(telethon_process.wait(), timeout=30)
        except asyncio.TimeoutError:
            logger.warning("💀 Force killing Telethon process...")
            telethon_process.kill()
            await telethon_process.wait()

    logger.info("👋 Shutdown complete")
    sys.exit(0)

def signal_handler(signum, frame):
    """Signal handler for graceful shutdown"""
    if not is_shutting_down:
        asyncio.create_task(graceful_shutdown(signum))

async def main():
    """Main function"""
    logger.info("🌟 KOL Tracker Telethon Keep-Alive Wrapper Starting...")
    logger.info("📊 Configuration:")
    logger.info(f"   - Health Check Interval: {HEALTH_CHECK_INTERVAL}s")
    logger.info(f"   - Max Restart Attempts: {MAX_RESTART_ATTEMPTS}")
    logger.info(f"   - Keep Alive: {'Enabled' if os.getenv('KEEP_ALIVE') == 'true' else 'Disabled'}")

    # Set up signal handlers
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)

    # Start services concurrently
    tasks = [
        asyncio.create_task(start_telethon()),
        asyncio.create_task(health_check_loop()),
        asyncio.create_task(keep_alive_ping())
    ]

    try:
        await asyncio.gather(*tasks)
    except KeyboardInterrupt:
        await graceful_shutdown('SIGINT')
    except Exception as e:
        logger.error(f"Unexpected error in main loop: {e}")
        await graceful_shutdown('ERROR')

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("👋 Interrupted by user")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1) 