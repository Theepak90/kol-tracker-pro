#!/bin/bash

echo "🚀 Starting KOL Tracker Backend..."

# Set environment variables
export NODE_ENV=development
export PORT=3000
export JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
export CORS_ORIGIN=http://localhost:5173,https://kolnexus.vercel.app

# Start the backend
cd backend
echo "📦 Installing dependencies..."
npm install

echo "🎯 Starting server..."
node simple-server.js 