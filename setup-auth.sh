#!/bin/bash

# KOL Tracker Pro - Authentication Setup Script
echo "🔐 Setting up Telegram Authentication..."

# Navigate to telethon service directory
cd backend/telethon_service

# Remove any existing corrupted session files
echo "🧹 Cleaning up existing session files..."
rm -f telegram_session.session* telethon.pid *.sqlite *.db 2>/dev/null || true

# Run authentication setup
echo "📱 Starting Telegram authentication..."
echo "You'll need to provide:"
echo "1. Your phone number (with country code, e.g., +1234567890)"
echo "2. The verification code sent to your phone"
echo "3. Your 2FA password (if enabled)"
echo ""

python3 auth_setup.py

if [ $? -eq 0 ]; then
    echo "✅ Authentication successful!"
    echo "🚀 You can now start the services with: ./start-services.sh"
else
    echo "❌ Authentication failed. Please try again."
    exit 1
fi 