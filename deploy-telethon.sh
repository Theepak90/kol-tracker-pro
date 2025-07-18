#!/bin/bash

echo "🚀 Deploying Python Telethon Service for Real Authentication"
echo "=========================================================="

# Check if we're in the right directory
if [ ! -d "backend/telethon_service" ]; then
    echo "❌ Error: backend/telethon_service directory not found"
    echo "Please run this from the project root directory"
    exit 1
fi

cd backend/telethon_service

echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

echo "🔧 Setting up environment..."
if [ ! -f ".env" ]; then
    cp env.example .env
    echo "✅ Created .env file from template"
    echo "⚠️  Please edit .env with your MongoDB credentials if needed"
else
    echo "✅ .env file already exists"
fi

echo "🧪 Testing service startup..."
echo "Starting Python Telethon service on http://localhost:8000"
echo "Press Ctrl+C to stop the service"
echo ""
echo "🔗 Once running, update your frontend environment:"
echo "   VITE_TELETHON_SERVICE_URL=http://localhost:8000"
echo ""
echo "Starting service..."

python3 main.py 