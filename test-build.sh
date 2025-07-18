#!/bin/bash

echo "🧪 Testing build process locally..."

# Clean up previous builds
echo "🧹 Cleaning up previous builds..."
rm -rf dist/
rm -rf backend/dist/

# Test frontend build
echo "🎨 Testing frontend build..."
npm run build:frontend
if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Test backend build
echo "🏗️ Testing backend build..."
cd backend

# Install dependencies
npm install --legacy-peer-deps
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Backend dependencies failed"
    exit 1
fi

# Build backend
npx nest build
if [ $? -eq 0 ]; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed - trying alternative method..."
    npx @nestjs/cli build
    if [ $? -eq 0 ]; then
        echo "✅ Backend build successful with alternative method"
    else
        echo "❌ Backend build failed with both methods"
        exit 1
    fi
fi

# Check if files exist
cd ..
if [ -f "dist/index.html" ] && [ -f "backend/dist/main.js" ]; then
    echo "🎉 Build test successful!"
    echo "📁 Frontend built to: dist/"
    echo "📁 Backend built to: backend/dist/"
    echo ""
    echo "📋 To test locally:"
    echo "1. Set environment variables"
    echo "2. Run: node backend/dist/main.js"
    echo "3. Visit: http://localhost:3000"
else
    echo "❌ Build files not found"
    exit 1
fi 