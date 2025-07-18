#!/bin/bash

echo "🚀 Building KOL Tracker Pro for Render deployment..."

# Set environment
export NODE_ENV=production

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Build frontend
echo "🎨 Building frontend..."
npm run build:frontend

# Install backend dependencies with all packages (not just production)
echo "📦 Installing backend dependencies..."
cd backend
npm install --legacy-peer-deps

# Build backend
echo "🏗️ Building backend..."
npm run build

# Return to root
cd ..

echo "✅ Build completed successfully!"
echo "Backend built to: backend/dist/"
echo "Frontend built to: dist/" 