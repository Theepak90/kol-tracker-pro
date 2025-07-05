# 🚀 KOL Tracker Pro Deployment Guide

## Overview
This guide covers deploying the KOL Tracker Pro application with separate frontend and backend deployments.

## 🌐 Frontend Deployment (Vercel)

### Prerequisites
- GitHub repository connected to Vercel
- Vercel account with project configured

### Configuration
The frontend is configured for Vercel deployment with:
- **Framework**: Vite
- **Build Command**: `npm run build:frontend`
- **Output Directory**: `dist`
- **Install Command**: `npm install --legacy-peer-deps`

### Environment Variables (Vercel)
Set these in your Vercel project settings:
```
VITE_API_URL=https://your-backend-url.onrender.com
VITE_TELETHON_SERVICE_URL=https://your-telethon-service-url.onrender.com
VITE_TELEGRAM_API_ID=28152923
VITE_TELEGRAM_API_HASH=766760d2838474a5e6dd734d785aa7ad
```

### Deployment Status
- ✅ **Fixed**: Removed backend functions from vercel.json
- ✅ **Fixed**: Added .vercelignore for backend exclusion
- ✅ **Fixed**: Proper build command configuration
- ✅ **Ready**: Frontend deployment should now work

---

## 🖥️ Backend Deployment (Render)

### Main Backend Service
**Service Type**: Web Service
**Build Command**: `npm install --legacy-peer-deps --production`
**Start Command**: `node simple-server.js`
**Root Directory**: `backend`

#### Environment Variables:
```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kol_tracker
JWT_SECRET=your-jwt-secret-key
CORS_ORIGIN=https://kol-tracker-pro.vercel.app
```

### Telethon Service (Python)
**Service Type**: Web Service
**Build Command**: `pip install -r requirements.txt`
**Start Command**: `python main.py`
**Root Directory**: `backend/telethon_service`

#### Environment Variables:
```
API_ID=28152923
API_HASH=766760d2838474a5e6dd734d785aa7ad
SESSION_NAME=telegram_session
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kol_tracker
PORT=8000
```

---

## 🗄️ Database Setup (MongoDB Atlas)

### Steps:
1. Create MongoDB Atlas account
2. Create a new cluster
3. Create database user with readWrite permissions
4. Add IP addresses to whitelist (0.0.0.0/0 for all)
5. Get connection string and add to environment variables

### Database Name: `kol_tracker`
### Collections:
- `users` - User authentication and profiles
- `group_scans` - Channel scan results
- `kol_data` - KOL analytics data
- `game_sessions` - Game session data

---

## 🔧 Current Service Status

### ✅ Working Locally:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Telethon**: http://localhost:8000
- **Telegram API**: Connected and authenticated

### 🚀 Production URLs:
- **Frontend**: https://kol-tracker-pro.vercel.app
- **Backend**: https://kolnexus-backend.onrender.com (needs deployment)
- **Telethon**: https://kolnexus-telethon.onrender.com (needs deployment)

---

## 🔐 Security Notes

### API Keys:
- Telegram API credentials are included in the configuration
- MongoDB credentials should be secured in environment variables
- JWT secret should be a strong, random string

### CORS Configuration:
- Backend is configured for kol-tracker-pro.vercel.app
- Update CORS_ORIGIN when deploying to different domains

---

## 📋 Deployment Checklist

### Frontend (Vercel):
- [x] Fixed vercel.json configuration
- [x] Added .vercelignore for backend exclusion
- [x] Set environment variables
- [x] Build command tested locally
- [x] Pushed to GitHub repository

### Backend (Render):
- [ ] Create new Web Service on Render
- [ ] Set root directory to `backend`
- [ ] Configure build and start commands
- [ ] Set environment variables
- [ ] Deploy and test API endpoints

### Telethon Service (Render):
- [ ] Create new Web Service on Render
- [ ] Set root directory to `backend/telethon_service`
- [ ] Configure Python build and start commands
- [ ] Set Telegram API environment variables
- [ ] Deploy and test health endpoint

### Database (MongoDB Atlas):
- [ ] Create cluster and database
- [ ] Set up user permissions
- [ ] Configure IP whitelist
- [ ] Update connection strings in environment variables

---

## 🧪 Testing Deployment

### Frontend Testing:
```bash
# Local build test
npm run build:frontend

# Preview production build
npm run preview
```

### Backend Testing:
```bash
# Test API endpoint
curl https://your-backend-url.onrender.com/api

# Test Telethon service
curl https://your-telethon-service-url.onrender.com/health
```

### Integration Testing:
- Test authentication flow
- Test channel scanning functionality
- Test KOL analysis features
- Test real-time updates

---

## 🔄 Troubleshooting

### Common Issues:
1. **Build failures**: Check build logs for missing dependencies
2. **API connection errors**: Verify environment variables
3. **Database connection issues**: Check MongoDB connection string
4. **CORS errors**: Verify CORS_ORIGIN configuration

### Logs:
- Vercel: Check deployment logs in Vercel dashboard
- Render: Check service logs in Render dashboard
- Local: Check terminal output for error messages

---

## 📞 Support

For deployment issues:
- Check logs in respective platforms
- Verify environment variables are set correctly
- Test API endpoints individually
- Ensure all services are running

**Current Status**: Frontend deployment fixed, backend deployment ready for Render setup. 