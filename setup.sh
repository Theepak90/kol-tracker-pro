#!/bin/bash

# KOL Tracker Pro - Setup Script
# This script sets up the project for the first time

echo "🚀 Setting up KOL Tracker Pro..."
echo "================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   https://nodejs.org/"
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python first:"
    echo "   https://python.org/"
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB:"
    echo "   https://www.mongodb.com/try/download/community"
    echo "   macOS: brew install mongodb-community"
    echo "   Linux: Follow MongoDB installation guide"
    echo "   Windows: Download MongoDB installer"
fi

echo "📦 Installing frontend dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo "🐍 Setting up Python environment..."
cd backend/telethon_service

# Create virtual environment
echo "📦 Creating Python virtual environment..."
python -m venv venv || python3 -m venv venv

# Activate virtual environment
echo "📦 Activating Python virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

cd ../..

# Create environment file if it doesn't exist
if [ ! -f "backend/telethon_service/.env" ]; then
    echo "⚙️  Creating environment file..."
    cp backend/telethon_service/env.example backend/telethon_service/.env
    echo "📝 Please edit backend/telethon_service/.env with your Telegram API credentials"
    echo "   Get them from: https://my.telegram.org/"
fi

echo ""
echo "✅ Setup completed successfully!"
echo "================================="
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/telethon_service/.env with your Telegram API credentials"
echo "2. Start MongoDB service"
echo "3. Run ./start.sh to start all services"
echo ""
echo "🔗 Get Telegram API credentials:"
echo "   1. Go to https://my.telegram.org/"
echo "   2. Log in with your phone number"
echo "   3. Go to 'API Development Tools'"
echo "   4. Create a new application"
echo "   5. Copy API_ID and API_HASH to .env file"
echo ""
echo "🚀 To start the application, run: ./start.sh" 