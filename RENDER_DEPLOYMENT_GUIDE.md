# 🚀 KOL Tracker Pro - Complete Render Deployment Guide

## 🎯 Quick Setup Summary

### 1. **MongoDB Database Setup (Required)**
- Go to [MongoDB Atlas](https://cloud.mongodb.com/)
- Create free account → New cluster (M0 Sandbox - Free tier)
- Create database user: `kol-tracker-admin` with strong password
- Add IP address: `0.0.0.0/0` (Allow access from anywhere)
- Get connection string from "Connect" → "Connect your application"

### 2. **JWT Secret Generation**
```bash
# Generate secure JWT secret (run locally)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📋 **ESSENTIAL ENVIRONMENT VARIABLES FOR RENDER**

### 🔧 **Backend Service Environment Variables**

Copy these exactly into your Render backend service:

```env
# === CORE CONFIGURATION ===
NODE_ENV=production
PORT=3000

# === DATABASE ===
MONGODB_URI=mongodb+srv://kol-tracker-admin:<password>@cluster0.xxxxx.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority
MONGODB_DB=kol-tracker-pro

# === AUTHENTICATION ===
JWT_SECRET=your-64-character-hex-jwt-secret-here
JWT_EXPIRES_IN=7d

# === API CONFIGURATION ===
API_BASE_URL=https://your-backend-service.onrender.com
CORS_ORIGIN=https://your-frontend-service.onrender.com

# === TELEGRAM API (Optional - for Telethon service) ===
TELEGRAM_API_ID=your-telegram-api-id
TELEGRAM_API_HASH=your-telegram-api-hash
TELEGRAM_SESSION_NAME=telegram_session

# === EXTERNAL SERVICES (Optional) ===
OPENAI_API_KEY=your-openai-api-key-if-using-ai-features
COINGECKO_API_KEY=your-coingecko-api-key-if-using-market-data
```

### 🌐 **Frontend Service Environment Variables**

Copy these exactly into your Render frontend service:

```env
# === API ENDPOINTS ===
VITE_API_BASE_URL=https://your-backend-service.onrender.com
VITE_TELETHON_BASE_URL=https://your-telethon-service.onrender.com

# === BLOCKCHAIN CONFIGURATION ===
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# === WALLET CONFIGURATION ===
VITE_WALLET_CONNECT_PROJECT_ID=your-walletconnect-project-id

# === ENVIRONMENT ===
NODE_ENV=production
```

### 🐍 **Telethon Service Environment Variables** (Optional)

If deploying the Telethon service separately:

```env
# === CORE CONFIGURATION ===
PORT=8000
PYTHON_ENV=production

# === DATABASE ===
MONGODB_URI=mongodb+srv://kol-tracker-admin:<password>@cluster0.xxxxx.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority

# === TELEGRAM API ===
API_ID=your-telegram-api-id
API_HASH=your-telegram-api-hash
SESSION_NAME=telegram_session

# === LOGGING ===
LOG_LEVEL=INFO
```

---

## 🔐 **How to Get Required API Keys**

### **MongoDB Atlas Setup**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create account → New Project → New Cluster
3. Choose M0 Sandbox (Free tier)
4. Create database user in "Database Access"
5. Add IP `0.0.0.0/0` in "Network Access"
6. Get connection string from "Connect" button

### **JWT Secret Generation**
```bash
# Run this command locally to generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### **Telegram API (Optional)**
1. Go to [my.telegram.org](https://my.telegram.org)
2. Login with your phone number
3. Go to "API Development Tools"
4. Create new application
5. Get `API_ID` and `API_HASH`

### **WalletConnect Project ID (Optional)**
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create account → New Project
3. Get Project ID from dashboard

---

## 🏗️ **Render Service Configuration**

### **Backend Service Settings**
- **Build Command**: `npm install; npm run build`
- **Start Command**: `npm start`
- **Environment**: `Node.js`
- **Region**: Choose closest to your users
- **Plan**: Free tier is fine for testing

### **Frontend Service Settings**
- **Build Command**: `npm install; npm run build`
- **Publish Directory**: `dist`
- **Environment**: `Static Site`
- **Region**: Same as backend
- **Plan**: Free tier is fine

---

## 🚨 **Common Issues & Solutions**

### **Build Failures**
```bash
# If you get dependency errors, try:
npm install --legacy-peer-deps --production
```

### **Database Connection Issues**
- Ensure MongoDB IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Verify database user permissions

### **CORS Issues**
- Set `CORS_ORIGIN` to your frontend URL
- Ensure both services are deployed and running

---

## 🧪 **Testing Your Deployment**

### **Backend Health Check**
```bash
curl https://your-backend-service.onrender.com/api
```

### **Frontend Access**
```bash
curl https://your-frontend-service.onrender.com
```

### **Database Connection Test**
Check backend logs for MongoDB connection success message.

---

## 📝 **Deployment Checklist**

- [ ] MongoDB Atlas cluster created and configured
- [ ] JWT secret generated (64-character hex string)
- [ ] Backend service deployed with all environment variables
- [ ] Frontend service deployed with API URLs
- [ ] Services can communicate (check CORS settings)
- [ ] Database connection working (check logs)
- [ ] Authentication working (test login/register)
- [ ] Frontend loads without errors

---

## 🆘 **Need Help?**

If you encounter issues:
1. Check Render service logs
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas is configured properly
4. Check that service URLs are correct in environment variables

---

## 🎉 **Success!**

Once deployed, your KOL Tracker Pro will be live at:
- **Frontend**: `https://your-frontend-service.onrender.com`
- **Backend API**: `https://your-backend-service.onrender.com/api`

Your users can now access the full application with all features working! 