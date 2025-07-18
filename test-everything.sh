#!/bin/bash

echo "🧪 KOL Tracker Pro - Complete System Test"
echo "=========================================="

cd /Users/theepak/Downloads/kol-tracker-pro-main

# Test 1: Check if ports are free
echo "🔍 Test 1: Checking if ports are free..."
if lsof -i:3000 >/dev/null 2>&1; then
    echo "❌ Port 3000 is in use"
else
    echo "✅ Port 3000 is free"
fi

if lsof -i:8000 >/dev/null 2>&1; then
    echo "❌ Port 8000 is in use"
else
    echo "✅ Port 8000 is free"
fi

if lsof -i:5173 >/dev/null 2>&1; then
    echo "❌ Port 5173 is in use"
else
    echo "✅ Port 5173 is free"
fi

# Test 2: Check environment files
echo ""
echo "🔍 Test 2: Checking environment files..."
if [ -f "backend/.env" ]; then
    echo "✅ Backend .env exists"
else
    echo "❌ Backend .env missing"
fi

if [ -f "backend/telethon_service/.env" ]; then
    echo "✅ Telethon .env exists"
else
    echo "❌ Telethon .env missing"
fi

if [ -f ".env" ]; then
    echo "✅ Frontend .env exists"
else
    echo "❌ Frontend .env missing"
fi

# Test 3: Check Telegram database
echo ""
echo "🔍 Test 3: Checking Telegram database..."
cd backend/telethon_service
if [ -f "telegram_session.session" ]; then
    if python3 -c "import sqlite3; conn = sqlite3.connect('telegram_session.session'); conn.close()" 2>/dev/null; then
        echo "✅ Telegram database is accessible"
    else
        echo "❌ Telegram database is locked"
    fi
else
    echo "⚠️  Telegram session file doesn't exist (needs authentication)"
fi

# Test 4: Check for Git merge conflicts
echo ""
echo "🔍 Test 4: Checking for Git merge conflicts..."
cd /Users/theepak/Downloads/kol-tracker-pro-main
if grep -r "<<<<<<< HEAD" src/ 2>/dev/null; then
    echo "❌ Git merge conflicts found"
else
    echo "✅ No Git merge conflicts"
fi

# Test 5: Check Tailwind CSS issues
echo ""
echo "🔍 Test 5: Checking for Tailwind CSS issues..."
if grep -r "primary/50" src/ 2>/dev/null; then
    echo "❌ Tailwind opacity issues found"
else
    echo "✅ No Tailwind opacity issues"
fi

if grep -r "@apply.*group" src/ 2>/dev/null; then
    echo "❌ Tailwind @apply group issues found"
else
    echo "✅ No @apply group issues"
fi

# Test 6: Test MongoDB connection (if URL is correct)
echo ""
echo "🔍 Test 6: Testing MongoDB connection..."
if node backend/test-mongodb.js 2>/dev/null | grep -q "✅ MongoDB connection successful"; then
    echo "✅ MongoDB connection works"
else
    echo "❌ MongoDB connection failed (check cluster URL and IP whitelist)"
fi

# Test 7: Check Node.js dependencies
echo ""
echo "🔍 Test 7: Checking Node.js dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "⚠️  Frontend dependencies missing (run: npm install)"
fi

if [ -d "backend/node_modules" ]; then
    echo "✅ Backend dependencies installed"
else
    echo "⚠️  Backend dependencies missing (run: cd backend && npm install)"
fi

# Test 8: Check Python dependencies
echo ""
echo "🔍 Test 8: Checking Python dependencies..."
cd backend/telethon_service
if python3 -c "import telethon" 2>/dev/null; then
    echo "✅ Telethon is installed"
else
    echo "❌ Telethon not installed (run: pip install telethon)"
fi

if python3 -c "import pymongo" 2>/dev/null; then
    echo "✅ PyMongo is installed"
else
    echo "❌ PyMongo not installed (run: pip install pymongo)"
fi

echo ""
echo "🎯 Summary:"
echo "=========="
echo "✅ = Working correctly"
echo "❌ = Needs fixing"
echo "⚠️  = Needs attention"
echo ""
echo "📋 Next steps if tests fail:"
echo "1. For MongoDB issues: Update cluster URL in .env files"
echo "2. For Telegram issues: Run 'python3 auth_setup.py' in telethon_service folder"
echo "3. For dependency issues: Run 'npm install' in respective folders"
echo "4. For port issues: Run './fix-local-dev.sh' again" 