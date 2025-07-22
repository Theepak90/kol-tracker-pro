# 🚀 KOL Tracker Pro - Always-On Render Deployment Guide

Complete guide for deploying KOL Tracker with **always-running** backend and Telethon services on Render.

---

## 🌟 **Key Features**

✅ **Auto-Restart on Failures** - Services automatically restart if they crash  
✅ **Health Monitoring** - Continuous health checks with failure detection  
✅ **Keep-Alive Mechanisms** - Prevents services from sleeping on free tier  
✅ **Graceful Shutdown** - Proper cleanup on deployment updates  
✅ **Production Logging** - Comprehensive monitoring and debugging  
✅ **Session Persistence** - Telegram sessions preserved across restarts  

---

## 📋 **Prerequisites**

1. **GitHub Repository** ready for deployment
2. **Render Account** (free tier works, starter recommended)
3. **MongoDB Atlas** database (connection string required)
4. **Telegram API Credentials** (API_ID and API_HASH)

---

## 🔧 **Deployment Steps**

### **Step 1: Connect Repository to Render**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Select the repository containing your KOL Tracker code

### **Step 2: Configure Environment Variables**

#### **Backend Service Environment Variables:**
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority&serverSelectionTimeoutMS=10000&connectTimeoutMS=15000&socketTimeoutMS=45000
MONGODB_DB=kol-tracker-pro
JWT_SECRET=your_jwt_secret_here
KEEP_ALIVE=true
HEALTH_CHECK_INTERVAL=300000
RESTART_ON_FAILURE=true
```

#### **Telethon Service Environment Variables:**
```env
API_ID=your_telegram_api_id
API_HASH=your_telegram_api_hash
SESSION_NAME=telegram_session
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority&serverSelectionTimeoutMS=10000&connectTimeoutMS=15000&socketTimeoutMS=45000
MONGODB_DB=kol-tracker-pro
PORT=10000
PYTHON_VERSION=3.11.0
ENVIRONMENT=production
KEEP_ALIVE=true
HEALTH_CHECK_INTERVAL=300000
RESTART_ON_FAILURE=true
```

### **Step 3: Deploy Using Blueprint**

1. Render will automatically detect the `render.yaml` file
2. Review the services configuration:
   - **kol-tracker-backend** (Node.js API)
   - **kol-tracker-telethon** (Python Telegram service)
   - **kol-tracker-frontend** (React app)
3. Click **"Apply"** to start deployment

---

## 🛠 **Service Architecture**

### **Backend Service (Node.js)**
- **Plan**: Starter (recommended) or Free
- **Entry Point**: `keep-alive-wrapper.js`
- **Features**:
  - Auto-restart on failures (max 10 attempts/hour)
  - Health checks every 5 minutes
  - Keep-alive pings every 14 minutes
  - MongoDB fallback to in-memory storage
  - Real-time Socket.IO support

### **Telethon Service (Python)**
- **Plan**: Starter (recommended) or Free
- **Entry Point**: `keep-alive-wrapper.py`
- **Features**:
  - Auto-restart on failures (max 10 attempts/hour)
  - Health checks every 5 minutes
  - Keep-alive pings every 14 minutes
  - Persistent session storage (1GB disk)
  - Telegram API rate limiting

### **Frontend Service (React)**
- **Plan**: Starter or Free
- **Build**: Static site with Vite
- **Features**:
  - Optimized production build
  - Automatic service URL injection
  - CDN distribution

---

## 📊 **Monitoring & Health Checks**

### **Health Check Endpoints**

- **Backend**: `https://your-backend.onrender.com/api/health`
- **Telethon**: `https://your-telethon.onrender.com/health`
- **Frontend**: `https://your-frontend.onrender.com/`

### **What's Monitored**

✅ **Service Availability** - HTTP response checks  
✅ **MongoDB Connection** - Database connectivity  
✅ **Telegram Authentication** - API connection status  
✅ **Memory Usage** - Process resource monitoring  
✅ **Response Times** - Performance tracking  

### **Auto-Restart Triggers**

- HTTP health check failures
- Process crashes or exits
- Memory limit exceeded
- Unhandled exceptions
- MongoDB connection loss

---

## 🔄 **Keep-Alive Features**

### **Free Tier Protection**
- **14-minute pings** prevent service sleeping
- **Automatic wake-up** on incoming requests
- **Session persistence** across restarts

### **Restart Management**
- **Exponential backoff** on repeated failures
- **Maximum attempts** limit (10/hour)
- **Graceful shutdown** on deployments
- **Process cleanup** on restart

---

## 🗂 **Session & Data Persistence**

### **Telegram Sessions**
- **Persistent Disk**: 1GB mounted at `/sessions`
- **Automatic Backup**: Session files preserved
- **Cross-Restart**: Authentication persists

### **Database Fallback**
- **MongoDB Primary**: Full feature set
- **In-Memory Fallback**: Basic functionality
- **Auto-Recovery**: Reconnects when available

---

## 📱 **Custom Domain Setup (Optional)**

### **Configure Custom Domains**

1. **Backend**: `api.yourdomain.com`
2. **Telethon**: `telethon.yourdomain.com`
3. **Frontend**: `yourdomain.com`

### **DNS Configuration**
```dns
api.yourdomain.com      CNAME  your-backend.onrender.com
telethon.yourdomain.com CNAME  your-telethon.onrender.com
yourdomain.com          CNAME  your-frontend.onrender.com
www.yourdomain.com      CNAME  your-frontend.onrender.com
```

### **Environment Updates**
```env
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
VITE_API_URL=https://api.yourdomain.com
VITE_TELETHON_SERVICE_URL=https://telethon.yourdomain.com
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **MongoDB Connection Failures**
```bash
# Check logs for ENOTFOUND errors
# Solution: Update MONGODB_URI with proper connection timeouts
MONGODB_URI=mongodb+srv://user:pass@cluster.net/db?serverSelectionTimeoutMS=10000&connectTimeoutMS=15000
```

#### **Telethon Authentication Issues**
```bash
# Check if session files exist
# Solution: Re-run authentication setup
python backend/telethon_service/auth_setup.py
```

#### **Service Sleeping (Free Tier)**
```bash
# Check if keep-alive is enabled
KEEP_ALIVE=true
# Upgrade to Starter plan for better reliability
```

#### **Build Failures**
```bash
# Check build logs in Render dashboard
# Common fixes:
npm install --production  # Skip dev dependencies
pip install -r requirements.txt  # Python dependencies
```

### **Logs & Debugging**

1. **Render Dashboard** → Your Service → **"Logs"**
2. **Real-time Monitoring**: Live log streaming
3. **Error Tracking**: Automatic error capture
4. **Performance Metrics**: Response time tracking

---

## 💡 **Optimization Tips**

### **Performance**
- Use **Starter Plans** for better CPU/memory
- Enable **CDN** for frontend assets
- **Redis Caching** for session management
- **Connection Pooling** for MongoDB

### **Cost Management**
- **Free Tier**: 750 hours/month per service
- **Keep-Alive**: Maximizes free tier usage
- **Starter Plans**: $7/month per service
- **Database**: MongoDB Atlas free tier

### **Security**
- **Environment Variables**: Never commit secrets
- **CORS Configuration**: Restrict allowed origins
- **API Keys**: Rotate regularly
- **Session Management**: Secure token handling

---

## 🎯 **Next Steps**

1. **Deploy Services**: Use the render.yaml blueprint
2. **Verify Health**: Check all endpoints respond
3. **Test Telegram**: Authenticate and scan channels
4. **Monitor Logs**: Watch for any errors
5. **Custom Domain**: Set up your domain (optional)
6. **Performance Test**: Load test the APIs

---

## 📞 **Support**

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **MongoDB Atlas**: [mongodb.com/atlas](https://mongodb.com/atlas)
- **Telegram API**: [core.telegram.org](https://core.telegram.org)

---

## 🔗 **Quick Deploy**

Deploy directly to Render with one click:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

*Uses the render.yaml blueprint in your repository root* 