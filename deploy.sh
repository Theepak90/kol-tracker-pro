#!/bin/bash

# KOL Tracker Pro - Deployment Script
# This script helps deploy the application to production

echo "🚀 Deploying KOL Tracker Pro to Production..."
echo "============================================="

# Check if required tools are installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

echo "📋 Deployment Steps:"
echo "1. Deploy Telethon Service to Railway"
echo "2. Deploy Backend Service to Railway" 
echo "3. Build and Deploy Frontend to Netlify"
echo ""

read -p "🔑 Have you set up your environment variables? (y/n): " env_ready
if [ "$env_ready" != "y" ]; then
    echo "⚠️  Please set up your environment variables first:"
    echo "   - MongoDB Atlas connection string"
    echo "   - Telegram API credentials"
    echo "   - Railway and Netlify accounts"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
    exit 1
fi

echo ""
echo "🐍 Step 1: Deploying Telethon Service..."
cd backend/telethon_service
echo "📍 Current directory: $(pwd)"
railway login
railway up
TELETHON_URL=$(railway status --json | jq -r '.deployments[0].url')
echo "✅ Telethon Service deployed to: $TELETHON_URL"
cd ../..

echo ""
echo "🔧 Step 2: Deploying Backend Service..."
cd backend
echo "📍 Current directory: $(pwd)"
railway up
BACKEND_URL=$(railway status --json | jq -r '.deployments[0].url')
echo "✅ Backend Service deployed to: $BACKEND_URL"
cd ..

echo ""
echo "⚛️  Step 3: Building and Deploying Frontend..."
echo "📍 Current directory: $(pwd)"

# Update API configuration with deployed URLs
if [ ! -z "$BACKEND_URL" ] && [ ! -z "$TELETHON_URL" ]; then
    echo "🔧 Updating API configuration..."
    sed -i.bak "s|https://your-backend-url.railway.app|$BACKEND_URL|g" src/config/api.ts
    sed -i.bak "s|https://your-telethon-url.railway.app|$TELETHON_URL|g" src/config/api.ts
    sed -i.bak "s|https://your-backend-url.railway.app|$BACKEND_URL|g" netlify.toml
    echo "✅ API configuration updated"
fi

# Build the frontend
echo "🏗️  Building frontend..."
npm run build

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify login
netlify deploy --prod --dir=dist
FRONTEND_URL=$(netlify status --json | jq -r '.url')

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo "🐍 Telethon Service: $TELETHON_URL"
echo "🔧 Backend Service:   $BACKEND_URL"
echo "🌐 Frontend:          $FRONTEND_URL"
echo ""
echo "🔍 Testing URLs:"
echo "   Backend Health:  $BACKEND_URL/api"
echo "   Telethon Health: $TELETHON_URL/health"
echo ""
echo "📝 Next Steps:"
echo "1. Test all services are working"
echo "2. Update environment variables if needed"
echo "3. Configure custom domain (optional)"
echo ""
echo "🎯 Your KOL Tracker Pro is now live!" 