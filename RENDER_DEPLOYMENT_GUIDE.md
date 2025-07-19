# 🚀 KOL Tracker Pro - Render Deployment Guide

This guide will help you deploy all your backend services and Telegram services to Render cloud platform.

## 📋 Prerequisites

- GitHub account with your project repository
- Render account (free tier is sufficient to start)
- Render CLI installed on your machine

## 🛠️ Setup Process

### Step 1: Install Render CLI

```bash
# macOS (with Homebrew)
brew install render

# Linux/Unix
curl -fsSL https://cli.render.com/install | sh

# Windows (PowerShell)
iwr https://cli.render.com/install.ps1 -useb | iex
```

### Step 2: Login to Render

```bash
render auth login
```

### Step 3: Prepare Your Repository

1. Push all your code to GitHub
2. Ensure these files are present:
   - `render.yaml` ✅
   - `backend/render-start.js` ✅
   - `backend/telethon_service/render-start.py` ✅
   - `backend/simple-server.js` ✅
   - `backend/telethon_service/main.py` ✅

### Step 4: Deploy to Render

```bash
# Make the deployment script executable
chmod +x deploy-render.sh

# Run the deployment
./deploy-render.sh
```

## 🏗️ Services Architecture

Your deployment will create 3 services:

### 1. Backend API Service (`kol-tracker-backend`)
- **Type**: Web Service
- **Runtime**: Node.js
- **Port**: 10000
- **URL**: `https://kol-tracker-backend.onrender.com`
- **Purpose**: Main API, Bot Detection, Authentication

### 2. Telethon Service (`kol-tracker-telethon`)
- **Type**: Web Service  
- **Runtime**: Python 3.11
- **Port**: 10000
- **URL**: `https://kol-tracker-telethon.onrender.com`
- **Purpose**: Telegram integration, Real channel analysis

### 3. Frontend (`kol-tracker-frontend`)
- **Type**: Static Site
- **Runtime**: Node.js
- **URL**: `https://kol-tracker-frontend.onrender.com`
- **Purpose**: React application

## 🔧 Manual Deployment (Alternative)

If you prefer manual setup:

### Backend Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `kol-tracker-backend`
   - **Runtime**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node render-start.js`
5. Add environment variables from `render-backend-env.example`
6. Deploy

### Telethon Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository  
3. Configure:
   - **Name**: `kol-tracker-telethon`
   - **Runtime**: Python 3
   - **Build Command**: `cd backend/telethon_service && python -m pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `cd backend/telethon_service && python render-start.py`
4. Add environment variables from `render-telethon-env.example`
5. Add Persistent Disk:
   - **Name**: `telethon-sessions`
   - **Mount Path**: `/opt/render/project/backend/telethon_service/sessions`
   - **Size**: 1GB
6. Deploy

### Frontend Service

1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `kol-tracker-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add environment variables from `render-frontend-env.example`
5. Deploy

## 🔐 Environment Variables

### Backend Service Variables

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://theepakkumar187:XP3YPWryQfSGDeKM@cluster0.rvhxt.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority
MONGODB_DB=kol-tracker-pro
JWT_SECRET=5c3b577c95b24f768d746a31229d79e0a5be87183c92e4bf504c4d88e2ae5957a90aa61e6900fd7425f739e3c5f44f5b84fa3554cadbccefb95e2223736669f8
TELETHON_URL=https://kol-tracker-telethon.onrender.com
CORS_ORIGIN=https://kol-tracker-frontend.onrender.com
```

### Telethon Service Variables

```env
API_ID=28152923
API_HASH=766760d2838474a5e6dd734d785aa7ad
SESSION_NAME=telegram_session
MONGODB_URI=mongodb+srv://theepakkumar187:XP3YPWryQfSGDeKM@cluster0.rvhxt.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority
MONGODB_DB=kol-tracker-pro
PORT=10000
PYTHON_VERSION=3.11.0
```

### Frontend Service Variables

```env
NODE_ENV=production
VITE_API_URL=https://kol-tracker-backend.onrender.com
VITE_TELETHON_SERVICE_URL=https://kol-tracker-telethon.onrender.com
VITE_WS_ENDPOINT=wss://kol-tracker-backend.onrender.com
```

## 🔑 First Time Setup

After deployment:

1. Go to your frontend URL: `https://kol-tracker-frontend.onrender.com`
2. Navigate to the **Bot Detector** section
3. Click **"Connect Telegram"**
4. Follow the authentication process:
   - Enter your phone number
   - Enter the verification code
   - Enter 2FA password if required
5. Once authenticated, you can perform real bot analysis!

## 📊 Service Monitoring

### Check Service Status
```bash
render ps
```

### View Logs
```bash
# Backend logs
render logs kol-tracker-backend

# Telethon logs  
render logs kol-tracker-telethon

# Frontend logs
render logs kol-tracker-frontend
```

### Update Deployment
```bash
render deploy
```

## 🐛 Troubleshooting

### Services Won't Start

1. **Check logs**: `render logs <service-name>`
2. **Verify environment variables** are set correctly
3. **Check build logs** for dependency issues

### Bot Detection Shows "Authentication Required"

1. Go to frontend → Bot Detector
2. Click "Connect Telegram"
3. Complete authentication flow
4. Sessions are persisted in Render disk storage

### Frontend Can't Connect to Backend

1. Verify environment variables in frontend service
2. Check CORS settings in backend
3. Ensure services are running: `render ps`

### MongoDB Connection Issues

1. Verify `MONGODB_URI` is correct in both services
2. Check MongoDB Atlas network access settings
3. Ensure database user has proper permissions

## 💰 Cost Considerations

### Free Tier Limits
- **Web Services**: 750 hours/month (always-on with paid plan)
- **Static Sites**: Unlimited
- **Bandwidth**: 100GB/month
- **Build Minutes**: 500/month

### Performance Notes
- Free tier services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to paid plans for production use

## 🔄 Updating Your Deployment

When you make code changes:

1. Push changes to GitHub
2. Run: `render deploy`
3. Or enable auto-deploy from GitHub in Render dashboard

## 📞 Support

If you encounter issues:

1. Check this guide first
2. Review Render's [documentation](https://render.com/docs)
3. Check service logs for error details
4. Verify all environment variables are set correctly

## 🎉 Success!

Once deployed, your KOL Tracker Pro will be fully operational in the cloud with:

- ✅ Real-time bot detection
- ✅ Telegram channel analysis  
- ✅ Persistent user sessions
- ✅ MongoDB data storage
- ✅ Automatic scaling
- ✅ HTTPS security

Your services will be available 24/7 at:
- **Frontend**: `https://kol-tracker-frontend.onrender.com`
- **Backend API**: `https://kol-tracker-backend.onrender.com`
- **Telethon Service**: `https://kol-tracker-telethon.onrender.com` 