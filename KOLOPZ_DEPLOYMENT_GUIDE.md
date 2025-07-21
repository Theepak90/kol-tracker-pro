# 🚀 kolopz.com Deployment Fix Guide

## ❌ Issue: "Failed to parse JSON" Error

When deploying to `kolopz.com`, you're getting JSON parsing errors because the frontend is trying to connect to localhost URLs instead of your production backend.

## ✅ Solution: Update Environment Variables

### 1. **Frontend Environment Variables**

Set these in your frontend deployment platform (Vercel, Netlify, etc.):

```bash
# Backend API URL (your backend service)
VITE_API_URL=https://api.kolopz.com

# Telethon Service URL (your Python Telegram service)  
VITE_TELETHON_SERVICE_URL=https://telethon.kolopz.com

# WebSocket URL (for real-time features)
VITE_WS_ENDPOINT=wss://api.kolopz.com
```

### 2. **Domain Setup Required**

You need to deploy 3 services to make this work:

#### **Main Frontend** → `kolopz.com`
- Your React app 
- Already deployed ✅

#### **Backend API** → `api.kolopz.com`
- Your Node.js backend (`backend/simple-server.js`)
- Handles KOL data, authentication, etc.

#### **Telethon Service** → `telethon.kolopz.com`  
- Your Python service (`backend/telethon_service/main.py`)
- Handles real Telegram data

### 3. **Backend Deployment**

Deploy your backend to `api.kolopz.com`:

```bash
# Environment variables for backend
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://theepakkumar187:XP3YPWryQfSGDeKM@cluster0.rvhxt.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority
JWT_SECRET=5c3b577c95b24f768d746a31229d79e0a5be87183c92e4bf504c4d88e2ae5957a90aa61e6900fd7425f739e3c5f44f5b84fa3554cadbccefb95e2223736669f8
TELETHON_URL=https://telethon.kolopz.com
CORS_ORIGIN=https://kolopz.com
```

### 4. **Telethon Service Deployment**

Deploy your Telethon service to `telethon.kolopz.com`:

```bash
# Environment variables for Telethon service
MONGODB_URI=mongodb+srv://theepakkumar187:XP3YPWryQfSGDeKM@cluster0.rvhxt.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority
API_ID=28152923
API_HASH=your_telegram_api_hash
SESSION_NAME=telegram_session
PORT=8000
PYTHON_VERSION=3.11.0
```

### 5. **Quick Test Commands**

After deployment, test these URLs:

```bash
# Test backend API
curl https://api.kolopz.com/api

# Test Telethon service  
curl https://telethon.kolopz.com/health

# Test frontend
curl https://kolopz.com
```

### 6. **Alternative: Quick Fix for Testing**

If you want to test with your current localhost setup, temporarily set:

```bash
# In your frontend deployment
VITE_API_URL=http://localhost:3000
VITE_TELETHON_SERVICE_URL=http://localhost:8000
VITE_WS_ENDPOINT=ws://localhost:3000
```

**But this only works if your local services are publicly accessible!**

## 🎯 Root Cause

The "failed to parse JSON" error happens because:

1. Frontend tries to call `https://api.kolopz.com/api/kols`
2. But `api.kolopz.com` doesn't exist or returns HTML instead of JSON
3. JavaScript can't parse HTML as JSON → Error

## 🚀 Next Steps

1. **Deploy backend** to `api.kolopz.com`
2. **Deploy Telethon** to `telethon.kolopz.com`  
3. **Set environment variables** in your frontend deployment
4. **Test the URLs** to ensure they return JSON

Your app will work perfectly once all 3 services are properly deployed! 🎉 