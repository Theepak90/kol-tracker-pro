# 🚀 MongoDB Atlas Setup Guide

## 📋 **Current Status**
- ✅ Username: `theepakkumar187`
- ✅ Password: `XP3YPWryQfSGDeKM`
- ❌ Cluster URL needs to be corrected

## 🔧 **Fix Required: Correct Cluster URL**

The current cluster URL `cluster0.0wgm1.mongodb.net` appears to be incorrect. Here's how to get the correct URL:

### **Step 1: Get Correct Connection String**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign in with your credentials
3. Click "Connect" on your cluster
4. Choose "Connect your application"
5. Copy the connection string

### **Step 2: Expected Format**
The correct format should be:
```
mongodb+srv://theepakkumar187:XP3YPWryQfSGDeKM@cluster0.<5-char-code>.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority
```

Where `<5-char-code>` is usually something like `abcde`, `xyz12`, etc.

### **Step 3: Common Cluster URLs**
Try these common formats:
- `mongodb+srv://theepakkumar187:XP3YPWryQfSGDeKM@cluster0.abcde.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority`
- `mongodb+srv://theepakkumar187:XP3YPWryQfSGDeKM@cluster0.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority`

### **Step 4: Update Environment Files**
Once you have the correct URL, update these files:
- `render-backend-env.txt`
- `render-telethon-env.txt`
- `backend/.env`
- `backend/telethon_service/.env`

### **Step 5: Test Connection**
Run the test script:
```bash
cd backend
node test-mongodb.js
```

## 🛠️ **Alternative: Create New Cluster**
If you can't access the existing cluster:

1. **Create New Cluster:**
   - Go to MongoDB Atlas
   - Create a new cluster (M0 Sandbox - Free)
   - Note the new cluster URL

2. **Set Up Database Access:**
   - Go to "Database Access"
   - Add user: `theepakkumar187`
   - Password: `XP3YPWryQfSGDeKM`
   - Privileges: "Read and write to any database"

3. **Set Up Network Access:**
   - Go to "Network Access"
   - Add IP: `0.0.0.0/0` (Allow access from anywhere)

4. **Get Connection String:**
   - Click "Connect" → "Connect your application"
   - Copy the connection string

## 📝 **Ready-to-Use Environment Variables**
Once you have the correct cluster URL, here are your environment variables:

### **Backend (.env)**
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://theepakkumar187:XP3YPWryQfSGDeKM@cluster0.XXXXX.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority
MONGODB_DB=kol-tracker-pro
JWT_SECRET=5c3b577c95b24f768d746a31229d79e0a5be87183c92e4bf504c4d88e2ae5957a90aa61e6900fd7425f739e3c5f44f5b84fa3554cadbccefb95e2223736669f8
```

### **Telethon Service (.env)**
```
PORT=8000
API_ID=28152923
API_HASH=766760d2838474a5e6dd734d785aa7ad
SESSION_NAME=telegram_session
MONGODB_URI=mongodb+srv://theepakkumar187:XP3YPWryQfSGDeKM@cluster0.XXXXX.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority
```

Replace `XXXXX` with your actual cluster code! 