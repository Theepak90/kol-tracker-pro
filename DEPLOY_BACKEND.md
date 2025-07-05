# 🚀 Backend Deployment Guide

## Quick 24/7 Deployment Options

### Option 1: Render (Recommended - Free & Easy)

1. **Go to [render.com](https://render.com)** and sign up
2. **Connect your GitHub account**
3. **Create a new Web Service**
4. **Select this repository**
5. **Configure:**
   - **Root Directory**: `backend`
   - **Build Command**: `npm install --legacy-peer-deps`
   - **Start Command**: `npm start`
   - **Environment**: Node.js
6. **Add Environment Variables:**
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: production
7. **Deploy!**

### Option 2: Railway (Alternative)

1. **Go to [railway.app](https://railway.app)** and sign up
2. **Create New Project → Deploy from GitHub**
3. **Select this repository**
4. **Configure:**
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
5. **Add Environment Variables:**
   - `MONGODB_URI`: Your MongoDB connection string
6. **Deploy!**

### Option 3: Glitch (Simplest)

1. **Go to [glitch.com](https://glitch.com)** and sign up
2. **Create New Project → Import from GitHub**
3. **Paste repository URL**
4. **Copy backend files to root**
5. **Auto-deploys!**

## 📋 Environment Variables Needed

```bash
MONGODB_URI=mongodb://localhost:27017/kol_tracker
NODE_ENV=production
PORT=3000
```

## 🔗 After Deployment

1. **Get your backend URL** (e.g., `https://your-app.render.com`)
2. **Update frontend config** in `src/config/api.ts`:
   ```typescript
   const PROD_BACKEND_URL = 'https://your-actual-backend-url.com';
   ```
3. **Redeploy frontend** to Netlify

## ✅ Current Status

- ✅ **Frontend**: Live at https://kolnexus2.netlify.app/
- ⚠️ **Backend**: Running locally (needs 24/7 hosting)
- ✅ **Database**: MongoDB with real data
- ✅ **API**: All endpoints working

## 🎯 Next Steps

1. Choose a deployment option above
2. Deploy backend
3. Update frontend with new backend URL
4. Enjoy 24/7 operation!

---

**Your KOL Tracker is ready for production! 🎉** 