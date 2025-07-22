#!/bin/bash

echo "🚀 Starting KOL Tracker Development Environment"
echo "=============================================="

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to kill processes on specific ports
cleanup_ports() {
    echo "🧹 Cleaning up ports..."
    
    # Kill processes on port 8000 (Telethon service)
    if check_port 8000; then
        echo "Killing process on port 8000..."
        lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    fi
    
    # Kill processes on ports 5173-5176 (Vite dev servers)
    for port in 5173 5174 5175 5176; do
        if check_port $port; then
            echo "Killing process on port $port..."
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
        fi
    done
    
    sleep 2
}

# Cleanup existing processes
cleanup_ports

# Start Telethon service in background
echo "🔧 Starting Telethon service on port 8000..."
cd backend/telethon_service
python3 main.py &
TELETHON_PID=$!
cd ../..

# Wait for Telethon service to start
echo "⏳ Waiting for Telethon service to initialize..."
sleep 5

# Check if Telethon service is running
if check_port 8000; then
    echo "✅ Telethon service started successfully on port 8000"
else
    echo "❌ Failed to start Telethon service"
    exit 1
fi

# Start frontend with environment variable
echo "🎨 Starting frontend with Telethon URL..."
VITE_TELETHON_SERVICE_URL=http://localhost:8000 npm run dev &
FRONTEND_PID=$!

# Function to cleanup on script exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $TELETHON_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    cleanup_ports
    echo "✅ Cleanup complete"
}

# Set trap to cleanup on script exit
trap cleanup EXIT

# Wait for both processes
echo ""
echo "🎉 Both services are starting up!"
echo "📱 Frontend will be available at: http://localhost:5173"
echo "🔧 Telethon API available at: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"

# Keep script running
wait 