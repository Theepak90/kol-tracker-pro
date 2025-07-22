#!/bin/bash

echo "🛑 Stopping KOL Tracker Development Services"
echo "============================================"

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        return 0
    else
        return 1
    fi
}

# Kill processes on port 8000 (Telethon service)
if check_port 8000; then
    echo "🔧 Stopping Telethon service (port 8000)..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Kill processes on ports 5173-5176 (Vite dev servers)
for port in 5173 5174 5175 5176; do
    if check_port $port; then
        echo "🎨 Stopping frontend service (port $port)..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
done

# Kill any remaining node or python processes related to the project
echo "🧹 Cleaning up remaining processes..."
pkill -f "python3 main.py" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

sleep 2

echo "✅ All services stopped successfully!"
echo "💡 Use ./start-dev.sh to start services again" 