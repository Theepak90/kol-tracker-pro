# 🚀 Deployment Guide

This guide will help you deploy your KOL Tracker Pro application to production using modern hosting platforms.

## 📋 Deployment Architecture

- **Frontend (React)** → **Netlify** (Static hosting)
- **Backend (NestJS)** → **Railway** (Node.js hosting) 
- **Telethon Service (Python)** → **Railway** (Python hosting)
- **Database** → **MongoDB Atlas** (Cloud database)

## 🗄️ Step 1: Set Up MongoDB Atlas (Database)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/atlas
   - Sign up for a free account
   - Create a new cluster (free tier)

2. **Configure Database**
   - Create a database user with username/password
   - Add your IP address to whitelist (or 0.0.0.0/0 for all IPs)
   - Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

## 🐍 Step 2: Deploy Telethon Service (Python)

### Option A: Railway (Recommended)

1. **Create Railway Account**
   - Go to https://railway.app/
   - Sign up with GitHub

2. **Deploy Telethon Service**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Navigate to telethon service
   cd backend/telethon_service
   
   # Deploy
   railway up
   ```

3. **Set Environment Variables in Railway**
   - `API_ID` - Your Telegram API ID
   - `API_HASH` - Your Telegram API Hash
   - `SESSION_NAME` - telegram_session
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `PORT` - 8000

4. **Get Your Telethon URL**
   - Railway will provide a URL like: `https://your-telethon-service.railway.app`

### Option B: Render

1. **Create Render Account**
   - Go to https://render.com/
   - Sign up with GitHub

2. **Create New Web Service**
   - Connect your GitHub repository
   - Set root directory to `backend/telethon_service`
   - Build command: `pip install -r requirements.txt`
   - Start command: `python main.py`

3. **Set Environment Variables**
   - Same as Railway above

## 🔧 Step 3: Deploy Backend Service (NestJS)

### Option A: Railway (Recommended)

1. **Deploy Backend Service**
   ```bash
   # Navigate to backend
   cd backend
   
   # Deploy to Railway
   railway up
   ```

2. **Set Environment Variables in Railway**
   - `NODE_ENV` - production
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - any random string for JWT tokens
   - `PORT` - 3000

3. **Get Your Backend URL**
   - Railway will provide a URL like: `https://your-backend-service.railway.app`

### Option B: Render

1. **Create New Web Service**
   - Connect your GitHub repository
   - Set root directory to `backend`
   - Build command: `npm install && npm run build`
   - Start command: `npm run start:prod`

2. **Set Environment Variables**
   - Same as Railway above

## 🌐 Step 4: Deploy Frontend (React) to Netlify

1. **Update API Configuration**
   - Edit `src/config/api.ts`
   - Replace the production URLs with your actual deployed URLs:
   ```typescript
   const PROD_BACKEND_URL = 'https://your-backend-service.railway.app';
   const PROD_TELETHON_URL = 'https://your-telethon-service.railway.app';
   ```

2. **Build the Frontend**
   ```bash
   npm run build
   ```

3. **Deploy to Netlify**

   ### Option A: Netlify CLI
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Deploy
   netlify deploy --prod --dir=dist
   ```

   ### Option B: Netlify Dashboard
   1. Go to https://netlify.com/
   2. Drag and drop your `dist` folder
   3. Or connect your GitHub repository

4. **Set Environment Variables in Netlify**
   - Go to Site settings → Environment variables
   - Add:
     - `VITE_BACKEND_URL` - Your backend Railway URL
     - `VITE_TELETHON_URL` - Your Telethon Railway URL

5. **Update netlify.toml**
   - Update the API redirect URL in `netlify.toml`:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://your-backend-service.railway.app/api/:splat"
     status = 200
     force = true
   ```

## 🔄 Step 5: Test Your Deployment

1. **Test Backend**
   - Visit: `https://your-backend-service.railway.app/api`
   - Should return: `{"message":"KOL Tracker API is running!"}`

2. **Test Telethon Service**
   - Visit: `https://your-telethon-service.railway.app/health`
   - Should return: `{"status":"ok"}`

3. **Test Frontend**
   - Visit your Netlify URL
   - All features should work with the deployed backend

## ⚙️ Environment Variables Summary

### Backend (Railway)
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kol_tracker
JWT_SECRET=your-random-jwt-secret
PORT=3000
```

### Telethon Service (Railway)
```
API_ID=your_telegram_api_id
API_HASH=your_telegram_api_hash
SESSION_NAME=telegram_session
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kol_tracker
PORT=8000
```

### Frontend (Netlify)
```
VITE_BACKEND_URL=https://your-backend-service.railway.app
VITE_TELETHON_URL=https://your-telethon-service.railway.app
```

## 🎯 Quick Deploy Commands

```bash
# 1. Deploy Telethon Service
cd backend/telethon_service
railway up

# 2. Deploy Backend
cd ../
railway up

# 3. Build and deploy Frontend
cd ../../
npm run build
netlify deploy --prod --dir=dist
```

## 🔧 Alternative Platforms

### For Backend/Telethon:
- **Heroku** (requires credit card)
- **Vercel** (for serverless functions)
- **DigitalOcean App Platform**
- **AWS/Google Cloud/Azure**

### For Frontend:
- **Vercel**
- **GitHub Pages**
- **Firebase Hosting**
- **Surge.sh**

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Make sure your frontend URL is added to CORS origins in backend
   - Check that API URLs are correct

2. **Database Connection**
   - Verify MongoDB Atlas connection string
   - Ensure IP whitelist includes 0.0.0.0/0 or your service IPs

3. **Telegram Authentication**
   - Ensure API_ID and API_HASH are correct
   - You may need to re-authenticate Telethon in production

4. **Environment Variables**
   - Double-check all environment variables are set correctly
   - Restart services after changing environment variables

## 🚀 Going Live Checklist

- [ ] MongoDB Atlas database created and configured
- [ ] Telethon service deployed and health check passes
- [ ] Backend service deployed and API responds
- [ ] Frontend built with correct production URLs
- [ ] Frontend deployed to Netlify
- [ ] All environment variables set correctly
- [ ] CORS configured for production domains
- [ ] Test all features end-to-end

---

**Your KOL Tracker Pro is now live! 🎉** 