# KOL Tracker Pro - Render Environment Setup Guide

## MongoDB Database Setup

### Option 1: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free account or sign in
3. Create a new cluster (M0 Sandbox - Free tier)
4. Set up database access:
   - Go to "Database Access" → "Add New Database User"
   - Username: `kol-tracker-admin`
   - Password: Generate a secure password (save this!)
   - Database User Privileges: "Read and write to any database"
5. Set up network access:
   - Go to "Network Access" → "Add IP Address"
   - Add: `0.0.0.0/0` (Allow access from anywhere - required for Render)
6. Get connection string:
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`)

### Option 2: Railway MongoDB (Alternative)
1. Go to [Railway.app](https://railway.app/)
2. Create account and new project
3. Add MongoDB service
4. Copy the connection string from the service details

## Generated Secure Tokens

### JWT Secret Token
```
JWT_SECRET=5762ba8fc2bd0a1f6c92f8d2810506e1cd10631c24476466505623ed66534f3484b52411d5c945126493e69002a711c778582c8e36045d84e9db4f58181b64d9
```

## Render Environment Variables

### For Backend Service (NestJS)
```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://kol-tracker-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority
JWT_SECRET=5762ba8fc2bd0a1f6c92f8d2810506e1cd10631c24476466505623ed66534f3484b52411d5c945126493e69002a711c778582c8e36045d84e9db4f58181b64d9
MONGODB_DB=kol-tracker-pro
```

### For Telethon Service (Python)
```
PORT=8000
API_ID=28152923
API_HASH=766760d2838474a5e6dd734d785aa7ad
SESSION_NAME=telegram_session
MONGODB_URI=mongodb+srv://kol-tracker-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority
```

### For Frontend Service (React/Vite)
```
VITE_API_BASE_URL=https://your-backend-service.onrender.com
VITE_TELETHON_BASE_URL=https://your-telethon-service.onrender.com
```

## Render Deployment Steps

### 1. Create Backend Service
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && npm start`
- **Environment**: Node.js
- **Region**: Choose closest to your users

### 2. Create Telethon Service
- **Build Command**: `cd backend/telethon_service && pip install -r requirements.txt`
- **Start Command**: `cd backend/telethon_service && python main.py`
- **Environment**: Python 3.7+
- **Region**: Same as backend

### 3. Create Frontend Service
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run preview`
- **Environment**: Node.js
- **Region**: Same as backend

## Important Notes

1. **Replace placeholders**: 
   - `YOUR_PASSWORD` with your actual MongoDB password
   - `your-backend-service.onrender.com` with your actual backend URL
   - `your-telethon-service.onrender.com` with your actual Telethon URL

2. **Security**: 
   - Never commit these tokens to version control
   - Use Render's environment variables feature
   - Regenerate tokens if compromised

3. **Database Name**: 
   - The database `kol-tracker-pro` will be created automatically
   - Collections will be created when first data is inserted

4. **Telegram Setup**:
   - You'll need to run the authentication script once after deployment
   - The session will be stored in MongoDB

## Testing Connection

After setting up, you can test the MongoDB connection with this command:
```bash
node -e "
const mongoose = require('mongoose');
mongoose.connect('YOUR_MONGODB_URI')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection failed:', err));
"
```

## Troubleshooting

### Common Issues:
1. **IP Whitelist**: Ensure `0.0.0.0/0` is added to MongoDB Atlas network access
2. **Connection String**: Make sure to replace `<password>` with actual password
3. **Database Name**: Ensure the database name matches in all services
4. **SSL/TLS**: Use `ssl=true` parameter if connection fails

### Health Check Endpoints:
- Backend: `https://your-backend-service.onrender.com/api`
- Telethon: `https://your-telethon-service.onrender.com/health` 