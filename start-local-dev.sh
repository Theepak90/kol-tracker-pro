#!/bin/bash

echo "🚀 Starting KOL Tracker Pro - Local Development"
echo "=============================================="

# Kill any existing processes on our ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Set local environment variables
export NODE_ENV=development
export PORT=3000
export JWT_SECRET=local-dev-jwt-secret-key-change-in-production
export CORS_ORIGIN="http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000"
export TELETHON_URL=http://localhost:8000
export KEEP_ALIVE=false
export HEALTH_CHECK_INTERVAL=60000
export LOG_LEVEL=debug
export DEBUG=true

# Telegram API configuration
export TELEGRAM_API_ID=28152923
export TELEGRAM_API_HASH=766760d2838474a5e6dd734d785aa7ad
export BACKEND_URL=http://localhost:3000

echo "✅ Environment variables set for local development"
echo ""

# Function to start backend
start_backend() {
    echo "🔧 Starting Backend Service (Port 3000)..."
    cd backend
    echo "📁 Backend directory: $(pwd)"
    
    # Start with simple-server.js (no database required)
    echo "🚀 Running: node simple-server.js"
    node simple-server.js &
    BACKEND_PID=$!
    echo "✅ Backend started with PID: $BACKEND_PID"
    cd ..
}

# Function to start Telethon
start_telethon() {
    echo "🐍 Starting Telethon Service (Port 8000)..."
    cd backend/telethon_service
    echo "📁 Telethon directory: $(pwd)"
    
    # Check if virtual environment exists
    if [ -d "venv" ]; then
        echo "🔧 Activating virtual environment..."
        source venv/bin/activate
    else
        echo "⚠️  Virtual environment not found. Using system Python."
    fi
    
    # Set Telethon environment variables
    export API_ID=$TELEGRAM_API_ID
    export API_HASH=$TELEGRAM_API_HASH
    export SESSION_NAME=telegram_session
    export ENVIRONMENT=development
    export PYTHON_VERSION=3.9
    
    # Start Telethon service
    echo "🚀 Running: python main.py"
    python main.py &
    TELETHON_PID=$!
    echo "✅ Telethon started with PID: $TELETHON_PID"
    cd ../..
}

# Start services
echo "🚀 Starting services in parallel..."
start_backend
sleep 2
start_telethon

echo ""
echo "🎉 LOCAL DEVELOPMENT SERVICES STARTED!"
echo "=============================================="
echo "🔧 Backend API:      http://localhost:3000"
echo "🐍 Telethon Service: http://localhost:8000" 
echo "🌐 Frontend:         http://localhost:5174"
echo ""
echo "📋 Backend PID:      $BACKEND_PID"
echo "📋 Telethon PID:     $TELETHON_PID"
echo ""
echo "💡 Tips:"
echo "   • Backend uses in-memory storage (no database needed)"
echo "   • Check logs above for any connection issues"
echo "   • Press Ctrl+C to stop all services"
echo ""

# Wait for interrupt
trap 'echo ""; echo "🛑 Stopping services..."; kill $BACKEND_PID $TELETHON_PID 2>/dev/null; echo "✅ Services stopped"; exit 0' INT

# Keep script running
echo "🔍 Services running... Press Ctrl+C to stop"
wait 