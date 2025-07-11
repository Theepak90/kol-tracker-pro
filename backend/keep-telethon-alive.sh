#!/bin/bash

# Keep Telethon service alive
echo "🔄 Starting Telethon Auto-Restart Monitor..."

SERVICE_DIR="telethon_service"
SERVICE_URL="http://localhost:8000/health"
LOG_FILE="telethon_monitor.log"

cd "$SERVICE_DIR" || exit 1

while true; do
    # Check if service is responding
    if ! curl -s --max-time 5 "$SERVICE_URL" > /dev/null 2>&1; then
        echo "$(date): ❌ Telethon service not responding, restarting..." | tee -a "$LOG_FILE"
        
        # Kill existing Python processes for this service
        pkill -f "python3 main.py" 2>/dev/null || true
        sleep 2
        
        # Start the service
        echo "$(date): 🚀 Starting Telethon service..." | tee -a "$LOG_FILE"
        python3 main.py > telethon.log 2>&1 &
        TELETHON_PID=$!
        
        # Wait for service to start
        sleep 10
        
        # Verify it started successfully
        if curl -s --max-time 5 "$SERVICE_URL" > /dev/null 2>&1; then
            echo "$(date): ✅ Telethon service restarted successfully (PID: $TELETHON_PID)" | tee -a "$LOG_FILE"
        else
            echo "$(date): ⚠️ Telethon service failed to start properly" | tee -a "$LOG_FILE"
        fi
    else
        echo "$(date): ✅ Telethon service is healthy" | tee -a "$LOG_FILE"
    fi
    
    # Check every 30 seconds
    sleep 30
done 