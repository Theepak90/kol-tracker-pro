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

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed"
    exit 1
fi

# Build backend with multiple fallback methods
echo "🏗️ Building backend..."

# Method 1: Try nest build
echo "🔄 Attempting Method 1: npx nest build"
npx nest build
if [ $? -eq 0 ]; then
    echo "✅ Backend build completed with nest build"
    cd ..
    echo "✅ Build completed successfully!"
    echo "Backend built to: backend/dist/"
    echo "Frontend built to: dist/"
    exit 0
fi

# Method 2: Try @nestjs/cli build
echo "🔄 Attempting Method 2: npx @nestjs/cli build"
npx @nestjs/cli build
if [ $? -eq 0 ]; then
    echo "✅ Backend build completed with @nestjs/cli build"
    cd ..
    echo "✅ Build completed successfully!"
    echo "Backend built to: backend/dist/"
    echo "Frontend built to: dist/"
    exit 0
fi

# Method 3: Reinstall @nestjs/cli and try again
echo "🔄 Attempting Method 3: Reinstalling @nestjs/cli"
npm install @nestjs/cli --save
npx nest build
if [ $? -eq 0 ]; then
    echo "✅ Backend build completed after reinstalling CLI"
    cd ..
    echo "✅ Build completed successfully!"
    echo "Backend built to: backend/dist/"
    echo "Frontend built to: dist/"
    exit 0
fi

# Method 4: Direct TypeScript compilation
echo "🔄 Attempting Method 4: Direct TypeScript compilation"
npx tsc -p tsconfig.json
if [ $? -eq 0 ]; then
    echo "✅ Backend build completed with TypeScript compiler"
    cd ..
    echo "✅ Build completed successfully!"
    echo "Backend built to: backend/dist/"
    echo "Frontend built to: dist/"
    exit 0
fi

# If all methods fail
echo "❌ All build methods failed"
cd ..
exit 1 