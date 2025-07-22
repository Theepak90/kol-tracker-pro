#!/bin/bash

echo "🛑 Stopping KOL Tracker Pro - Local Development Services"
echo "========================================================"

# Function to kill processes by port
kill_by_port() {
    local port=$1
    local service=$2
    echo "🔍 Checking for processes on port $port ($service)..."
    
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "🛑 Killing $service processes: $pids"
        kill -9 $pids 2>/dev/null
        sleep 1
        
        # Verify processes are killed
        local remaining=$(lsof -ti:$port 2>/dev/null)
        if [ -z "$remaining" ]; then
            echo "✅ $service stopped successfully"
        else
            echo "⚠️  Some $service processes may still be running"
        fi
    else
        echo "ℹ️  No $service processes found on port $port"
    fi
}

# Kill backend service (port 3000)
kill_by_port 3000 "Backend"

# Kill Telethon service (port 8000)
kill_by_port 8000 "Telethon"

# Also kill any node processes with simple-server.js or main.py
echo "🔍 Checking for specific service processes..."

# Kill simple-server.js processes
SIMPLE_SERVER_PIDS=$(pgrep -f "simple-server.js" 2>/dev/null)
if [ ! -z "$SIMPLE_SERVER_PIDS" ]; then
    echo "🛑 Killing simple-server.js processes: $SIMPLE_SERVER_PIDS"
    kill -9 $SIMPLE_SERVER_PIDS 2>/dev/null
    echo "✅ simple-server.js processes stopped"
fi

# Kill Telethon main.py processes  
TELETHON_PIDS=$(pgrep -f "telethon.*main.py" 2>/dev/null)
if [ ! -z "$TELETHON_PIDS" ]; then
    echo "🛑 Killing Telethon main.py processes: $TELETHON_PIDS"
    kill -9 $TELETHON_PIDS 2>/dev/null
    echo "✅ Telethon main.py processes stopped"
fi

echo ""
echo "✅ LOCAL DEVELOPMENT SERVICES STOPPED!"
echo "======================================="
echo "🔧 Backend API (port 3000): Stopped"
echo "🐍 Telethon Service (port 8000): Stopped"
echo ""
echo "💡 You can restart services with: ./start-local-dev.sh" 