#!/bin/bash

echo "🏗️ Building KOL Tracker Pro..."

# Update browserslist database
echo "📦 Updating browserslist database..."
npx update-browserslist-db@latest --force || echo "⚠️ Could not update browserslist"

# Build frontend first
echo "🎨 Building frontend..."
npm run build:frontend
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
echo "✅ Frontend build completed"

# Navigate to backend directory
cd backend

# Clean up any corrupted installations
echo "🧹 Cleaning backend dependencies..."
rm -rf node_modules package-lock.json

# Install backend dependencies with forced resolution
echo "📦 Installing backend dependencies..."
npm install --legacy-peer-deps --force
if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed"
    exit 1
fi

# Prepare backend for simple-server.js deployment
echo "🏗️ Preparing backend (using simple-server.js approach)..."

# Check if simple-server.js exists
if [ -f "simple-server.js" ]; then
    echo "✅ Backend ready - using simple-server.js (no compilation needed)"
    cd ..
    echo "✅ Build completed successfully!"
    echo "Frontend built to: dist/"
    echo "Backend ready: backend/simple-server.js"
    exit 0
else
    echo "❌ simple-server.js not found in backend directory"
fi
cd ..
exit 1 