# 🚀 KOL Tracker Pro - Complete Setup Guide

## 📋 **All Placeholder Values Confirmed**

### **Environment Files Created:**
- ✅ `render-backend-env.txt` - Backend service environment variables
- ✅ `render-telethon-env.txt` - Telethon service environment variables  
- ✅ `render-frontend-env.txt` - Frontend service environment variables
- ✅ `fix-local-dev.sh` - Local development fix script

---

## 🔧 **Quick Local Development Fix**

Run this script to fix all local issues (port conflicts, database locks, etc.):

```bash
./fix-local-dev.sh
```

This script will:
- Kill processes on ports 3000, 5173, 8000
- Clean up Telethon session files
- Install dependencies
- Build frontend
- Generate local environment variables
- Start MongoDB if needed

---

## 🌐 **Render Deployment - Environment Variables**

### **1. Backend Service Environment Variables**
Copy from `render-backend-env.txt`:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://kol-tracker-admin:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority
MONGODB_DB=kol-tracker-pro
JWT_SECRET=512de98c70a3296a30f1a0d6241f745031a4200037af8fd78d91ae4bf08fdc54c74f157e495bd02705bce0d9461e5b759a9acaa40722893c32e6b777032638093
```

**Replace these placeholders:**
- `YOUR_PASSWORD_HERE` → Your MongoDB password
- `cluster0.xxxxx` → Your MongoDB cluster URL

### **2. Telethon Service Environment Variables**
Copy from `render-telethon-env.txt`:

```env
PORT=8000
API_ID=YOUR_TELEGRAM_API_ID
API_HASH=YOUR_TELEGRAM_API_HASH
SESSION_NAME=telegram_session
MONGODB_URI=mongodb+srv://kol-tracker-admin:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority
```

**Replace these placeholders:**
- `YOUR_TELEGRAM_API_ID` → Your Telegram API ID
- `YOUR_TELEGRAM_API_HASH` → Your Telegram API Hash  
- `YOUR_PASSWORD_HERE` → Your MongoDB password
- `cluster0.xxxxx` → Your MongoDB cluster URL

### **3. Frontend Service Environment Variables**
Copy from `render-frontend-env.txt`:

```env
VITE_API_BASE_URL=https://your-backend-service.onrender.com
VITE_TELETHON_BASE_URL=https://your-telethon-service.onrender.com
```

**Replace these placeholders:**
- `your-backend-service` → Your actual backend service name
- `your-telethon-service` → Your actual telethon service name

---

## 📝 **Setup Steps**

### **Step 1: MongoDB Atlas Setup**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create free account → New cluster (M0 Sandbox)
3. Create database user: `kol-tracker-admin`
4. Set a strong password (save this!)
5. Add IP address: `0.0.0.0/0` (for Render access)
6. Get connection string

### **Step 2: Telegram API Setup**
1. Go to [https://my.telegram.org/auth](https://my.telegram.org/auth)
2. Login with your phone number
3. Go to "API development tools"
4. Create a new application
5. Copy the API ID and API Hash

### **Step 3: Render Deployment**
1. Create 3 services on Render:
   - Backend service (Node.js)
   - Telethon service (Python)
   - Frontend service (Static site)
2. Add environment variables from the files above
3. Replace all placeholder values
4. Deploy!

---

## 🎯 **Fresh Tokens Generated**

- **JWT Secret**: `512de98c70a3296a30f1a0d6241f745031a4200037af8fd78d91ae4bf08fdc54c74f157e495bd02705bce0d9461e5b759a9acaa40722893c32e6b777032638093`

---

## 🚀 **Local Development**

After running `./fix-local-dev.sh`:

1. **Terminal 1**: `cd backend && npm run start:dev`
2. **Terminal 2**: `cd backend/telethon_service && python3 main.py`  
3. **Terminal 3**: `npm run dev`

**URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Telethon: http://localhost:8000

---

## ✅ **All Placeholder Values Confirmed**

Every placeholder value is clearly marked and documented:

- ✅ `YOUR_PASSWORD_HERE` - MongoDB password
- ✅ `cluster0.xxxxx` - MongoDB cluster URL
- ✅ `YOUR_TELEGRAM_API_ID` - Telegram API ID
- ✅ `YOUR_TELEGRAM_API_HASH` - Telegram API Hash
- ✅ `your-backend-service` - Render backend service name
- ✅ `your-telethon-service` - Render telethon service name

**Everything is ready for deployment!** 🎉 