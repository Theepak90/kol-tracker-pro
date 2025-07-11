#!/bin/bash

# KOL Tracker Pro - Startup Script
# This script starts all three services: Backend, Telethon, and Frontend

echo "🚀 Starting KOL Tracker Pro..."
echo "================================="

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   macOS: brew services start mongodb-community"
    echo "   Linux: sudo systemctl start mongod"
    echo "   Windows: net start MongoDB"
    exit 1
fi

# Function to check if port is available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use. Killing existing process..."
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
check_port 3000
check_port 8000
check_port 5173

# Start Backend (NestJS)
echo "🔧 Starting Backend (NestJS) on port 3000..."
cd backend
npm run start:dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Start Telethon Service (Python)
echo "🐍 Starting Telethon Service (Python) on port 8000..."
cd backend/telethon_service

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo "📦 Activating Python virtual environment..."
    source venv/bin/activate
else
    echo "⚠️  Virtual environment not found. Creating one..."
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
fi

python main.py &
TELETHON_PID=$!
cd ../..

# Wait for Telethon service to start
sleep 5

# Start Frontend (React)
echo "⚛️  Starting Frontend (React) on port 5173..."
npm run dev &
FRONTEND_PID=$!

# Wait a bit for all services to start
sleep 3

echo ""
echo "✅ All services started successfully!"
echo "================================="
echo "🌐 Frontend:        http://localhost:5173"
echo "🔧 Backend API:     http://localhost:3000"
echo "🐍 Telethon API:    http://localhost:8000"
echo ""
echo "📱 Open your browser and go to: http://localhost:5173"
echo ""
echo "To stop all services, press Ctrl+C or run: ./stop.sh"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $BACKEND_PID $TELETHON_PID $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped."
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Keep script running
echo "🔄 Services are running. Press Ctrl+C to stop all services."
wait 