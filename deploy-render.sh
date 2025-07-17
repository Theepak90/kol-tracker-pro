#!/bin/bash

# Deploy to Render Script
echo "🚀 Deploying KOL Tracker to Render..."

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI is not installed. Please install it first:"
    echo "npm install -g @render/cli"
    exit 1
fi

# Check if user is logged in
if ! render auth whoami &> /dev/null; then
    echo "❌ Please login to Render first:"
    echo "render auth login"
    exit 1
fi

echo "✅ Render CLI is ready"

# Deploy using render.yaml
echo "📦 Deploying services from render.yaml..."
render deploy

echo "🎉 Deployment initiated! Check your Render dashboard for progress."
echo "📱 Backend URL: https://kol-tracker-backend.onrender.com"
echo "🤖 Telethon URL: https://kol-tracker-telethon.onrender.com"
echo ""
echo "⚠️  Note: Free tier services may take a few minutes to start up."
echo "💡 Remember to set up your environment variables in the Render dashboard." 