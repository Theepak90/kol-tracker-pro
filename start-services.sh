#!/bin/bash

# KOL Tracker Pro - 24/7 Service Startup Script
echo "🚀 Starting KOL Tracker Pro Services..."

# Create logs directory
mkdir -p logs

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -ti:$port > /dev/null 2>&1; then
        echo "⚠️  Port $port is in use. Killing existing processes..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Kill existing processes on required ports
echo "🔄 Checking and cleaning up existing processes..."
check_port 3000
check_port 8000
check_port 5173

# Stop any existing PM2 processes
echo "🛑 Stopping existing PM2 processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Check if Telethon session exists
if [ ! -f "backend/telethon_service/telegram_session.session" ]; then
    echo "🔐 Telethon session not found. Please run authentication first:"
    echo "cd backend/telethon_service && python3 auth_setup.py"
    echo "Then run this script again."
    exit 1
fi

# Start services with PM2
echo "🚀 Starting services with PM2..."
pm2 start ecosystem.config.js

# Show PM2 status
echo "📊 PM2 Status:"
pm2 status

# Show logs
echo "📋 To view logs:"
echo "pm2 logs kol-backend"
echo "pm2 logs kol-telethon"
echo "pm2 logs kol-frontend"

# Enable PM2 startup on system boot
echo "🔧 Setting up PM2 startup..."
pm2 startup
pm2 save

echo "✅ All services started successfully!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:3000"
echo "📡 Telethon: http://localhost:8000"

# Monitor services
echo "📈 Monitoring services (Ctrl+C to exit)..."
pm2 monit 