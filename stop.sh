#!/bin/bash

# KOL Tracker Pro - Stop Script
# This script stops all running services

echo "🛑 Stopping KOL Tracker Pro services..."
echo "======================================="

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "🔪 Stopping $service on port $port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
        echo "✅ $service stopped."
    else
        echo "ℹ️  $service is not running on port $port."
    fi
}

# Stop all services
kill_port 3000 "Backend (NestJS)"
kill_port 8000 "Telethon Service (Python)"
kill_port 5173 "Frontend (React)"

echo ""
echo "✅ All services have been stopped."
echo "🚀 To start again, run: ./start.sh" 