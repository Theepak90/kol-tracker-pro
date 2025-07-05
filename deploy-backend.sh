#!/bin/bash

echo "🚀 KOL Tracker Backend Deployment Helper"
echo "========================================"
echo ""

# Check if backend is running locally
if curl -s http://localhost:3000/api >/dev/null 2>&1; then
    echo "✅ Backend is running locally"
    echo "📊 Testing API endpoints..."
    
    # Test KOL endpoint
    if curl -s http://localhost:3000/api/kols >/dev/null 2>&1; then
        echo "✅ KOL API working"
    else
        echo "❌ KOL API not working"
    fi
    
    # Test Auth endpoint
    if curl -s http://localhost:3000/api/auth/register >/dev/null 2>&1; then
        echo "✅ Auth API working"
    else
        echo "❌ Auth API not working"
    fi
    
    echo ""
    echo "🌐 Ready for deployment!"
else
    echo "❌ Backend not running locally"
    echo "💡 Start with: cd backend && npm run start:simple"
    exit 1
fi

echo ""
echo "🔗 Deployment Options:"
echo "1. Render (Free): https://render.com"
echo "2. Railway (Free): https://railway.app"
echo "3. Glitch (Free): https://glitch.com"
echo ""
echo "📋 Configuration:"
echo "- Root Directory: backend"
echo "- Build Command: npm install --legacy-peer-deps"
echo "- Start Command: npm start"
echo "- Environment: Node.js"
echo ""
echo "🔧 Environment Variables:"
echo "- MONGODB_URI: Your MongoDB connection string"
echo "- NODE_ENV: production"
echo "- PORT: 3000"
echo ""
echo "📖 Full guide: See DEPLOY_BACKEND.md"
echo ""
echo "🎉 Your KOL Tracker is ready for 24/7 operation!" 