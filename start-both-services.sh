#!/bin/bash

# Kill any existing processes on the required ports
echo "Stopping existing services..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Wait for ports to be free
sleep 2

# Start telethon service in background
echo "Starting Telethon service on port 8000..."
cd backend/telethon_service
python3 main.py &
TELETHON_PID=$!
echo "Telethon service started with PID: $TELETHON_PID"

# Wait for telethon to start
sleep 5

# Go back to project root and start backend
cd ../../backend
echo "Starting Backend service on port 3000..."
npm run start:dev &
BACKEND_PID=$!
echo "Backend service started with PID: $BACKEND_PID"

# Wait for backend to start
sleep 5

# Check if both services are running
echo "Checking services..."
curl -s http://localhost:8000/health && echo "✅ Telethon service is running" || echo "❌ Telethon service failed"
curl -s http://localhost:3000/api && echo "✅ Backend service is running" || echo "❌ Backend service failed"

echo "Both services started. PIDs: Telethon=$TELETHON_PID, Backend=$BACKEND_PID"
echo "Press Ctrl+C to stop both services"

# Wait for user to stop
wait 