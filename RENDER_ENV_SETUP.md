# 🚀 KOL Tracker Pro - Render Environment Variables Setup

## 📋 **Quick Setup Guide**

I've created 3 environment files for easy copy-paste into Render:

### 📁 **Files Created:**
- `render-backend-env.txt` - Backend service environment variables
- `render-telethon-env.txt` - Telethon service environment variables  
- `render-frontend-env.txt` - Frontend service environment variables

---

## 🔧 **Step-by-Step Setup**

### **1. Set Up MongoDB Atlas (Required First)**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create free account → New cluster (M0 Sandbox - Free tier)
3. Create database user: `kol-tracker-admin` with a strong password
4. Add IP address: `0.0.0.0/0` (Allow access from anywhere)
5. Get connection string from "Connect" → "Connect your application"

### **2. Get Telegram API Credentials**
1. Go to [https://my.telegram.org/auth](https://my.telegram.org/auth)
2. Login with your phone number
3. Go to "API development tools"
4. Create a new application
5. Copy the **API ID** and **API Hash**

### **3. Backend Service Environment Variables**
1. Open `render-backend-env.txt`
2. Replace `YOUR_PASSWORD_HERE` with your MongoDB password
3. Replace `cluster0.xxxxx` with your actual MongoDB cluster URL
4. In Render Dashboard → Backend Service → Environment → Add each variable:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://kol-tracker-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority
MONGODB_DB=kol-tracker-pro
JWT_SECRET=3a53d3599b10a6553fb5adbc0d0ef1b1e114cb93cc067b395de538aa2958f0f5f4b3c46205c8ac47ec7ce540d154dfe2faf9b0a7d092102a57ccbe4ccb21823c
```

### **4. Telethon Service Environment Variables**
1. Open `render-telethon-env.txt`
2. Replace `YOUR_TELEGRAM_API_ID` with your Telegram API ID
3. Replace `YOUR_TELEGRAM_API_HASH` with your Telegram API Hash
4. Replace MongoDB credentials (same as backend)
5. In Render Dashboard → Telethon Service → Environment → Add each variable:

```
PORT=8000
API_ID=YOUR_TELEGRAM_API_ID
API_HASH=YOUR_TELEGRAM_API_HASH
SESSION_NAME=telegram_session
MONGODB_URI=mongodb+srv://kol-tracker-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority
```

### **5. Frontend Service Environment Variables**
1. Open `render-frontend-env.txt`
2. Replace service URLs with your actual Render service names
3. In Render Dashboard → Frontend Service → Environment → Add each variable:

```
VITE_API_BASE_URL=https://your-backend-service.onrender.com
VITE_TELETHON_BASE_URL=https://your-telethon-service.onrender.com
```

---

## ✅ **Deployment Order**

Deploy in this order for best results:

1. **Backend Service** (with MongoDB + JWT env vars)
2. **Telethon Service** (with Telegram API + MongoDB env vars)
3. **Frontend Service** (with backend/telethon URLs)

---

## 🔑 **Generated Credentials**

### **JWT Secret Token:**
```
3a53d3599b10a6553fb5adbc0d0ef1b1e114cb93cc067b395de538aa2958f0f5f4b3c46205c8ac47ec7ce540d154dfe2faf9b0a7d092102a57ccbe4ccb21823c
```

### **MongoDB Connection Template:**
```
mongodb+srv://kol-tracker-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority
```

---

## 🛠️ **How to Add Environment Variables in Render**

1. Go to your Render Dashboard
2. Select your service
3. Click "Environment" in the left sidebar
4. Click "Add Environment Variable"
5. Enter **Key** and **Value** from the env files
6. Click "Save Changes"
7. Your service will automatically redeploy

---

## 🚨 **Important Notes**

- **Never commit** these environment files to Git
- **Keep your MongoDB password secure**
- **Keep your Telegram API credentials private**
- All services must use the **same MongoDB URI**
- Frontend URLs must match your actual Render service names

---

## 📞 **Need Help?**

If you encounter issues:
1. Check that all environment variables are set correctly
2. Verify MongoDB connection string is valid
3. Ensure Telegram API credentials are correct
4. Check Render service logs for specific error messages 