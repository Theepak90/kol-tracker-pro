# KOL Tracker - Render Deployment Guide

This guide will help you deploy the KOL Tracker backend and Telethon service to Render's free tier.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **MongoDB Atlas**: Set up a free MongoDB Atlas cluster
3. **Telegram API Credentials**: API_ID and API_HASH from [my.telegram.org](https://my.telegram.org)
4. **Git Repository**: Your code should be in a GitHub repository

## Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster (M0 Sandbox)
3. Create a database user with read/write permissions
4. Whitelist all IP addresses (0.0.0.0/0) for Render
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/kol_tracker?retryWrites=true&w=majority`

## Step 2: Deploy to Render

### Option A: Using Render Dashboard (Recommended)

1. **Connect Repository**:
   - Go to your Render dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Deploy Backend Service**:
   - **Name**: `kol-tracker-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm ci && npm run build`
   - **Start Command**: `cd backend && npm run start:prod`
   - **Plan**: Free

3. **Deploy Telethon Service**:
   - **Name**: `kol-tracker-telethon`
   - **Environment**: `Python`
   - **Build Command**: `cd backend/telethon_service && pip install -r requirements.txt`
   - **Start Command**: `cd backend/telethon_service && python main.py`
   - **Plan**: Free

### Option B: Using render.yaml (Infrastructure as Code)

1. **Install Render CLI**:
   ```bash
   npm install -g @render/cli
   ```

2. **Login to Render**:
   ```bash
   render auth login
   ```

3. **Deploy**:
   ```bash
   ./deploy-render.sh
   ```

## Step 3: Configure Environment Variables

### Backend Service Environment Variables

Set these in your Render dashboard for the backend service:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kol_tracker?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
TELETHON_SERVICE_URL=https://kol-tracker-telethon.onrender.com
```

### Telethon Service Environment Variables

Set these in your Render dashboard for the Telethon service:

```
PYTHON_VERSION=3.9.16
API_ID=28152923
API_HASH=766760d2838474a5e6dd734d785aa7ad
SESSION_NAME=telegram_session
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kol_tracker?retryWrites=true&w=majority
PORT=8000
```

## Step 4: Telegram Authentication

Since Render doesn't support interactive authentication, you'll need to authenticate locally first:

1. **Run locally**:
   ```bash
   cd backend/telethon_service
   python auth_setup.py
   ```

2. **Upload session file**: You'll need to manually upload the `telegram_session.session` file to your Render service or use a cloud storage solution.

## Step 5: Test Your Deployment

1. **Backend Health Check**:
   ```
   https://kol-tracker-backend.onrender.com/api
   ```

2. **Telethon Health Check**:
   ```
   https://kol-tracker-telethon.onrender.com/health
   ```

3. **Test API Endpoints**:
   ```bash
   # Test backend
   curl https://kol-tracker-backend.onrender.com/api

   # Test Telethon
   curl https://kol-tracker-telethon.onrender.com/health
   ```

## Step 6: Update Frontend Configuration

Update your frontend to use the production URLs:

```typescript
// src/config/api.ts
const API_BASE_URL = 'https://kol-tracker-backend.onrender.com/api';
const TELETHON_BASE_URL = 'https://kol-tracker-telethon.onrender.com';
```

## Important Notes for Free Tier

⚠️ **Free Tier Limitations**:
- Services sleep after 15 minutes of inactivity
- Cold starts can take 30-60 seconds
- 750 hours/month limit per service
- No custom domains on free tier

💡 **Optimization Tips**:
- Use health check endpoints to keep services warm
- Consider upgrading to paid tier for production use
- Monitor service logs for debugging

## Troubleshooting

### Common Issues

1. **Service Won't Start**:
   - Check build logs in Render dashboard
   - Verify environment variables are set correctly
   - Ensure MongoDB connection string is correct

2. **Database Connection Issues**:
   - Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
   - Check database user permissions
   - Test connection string format

3. **Telegram Authentication**:
   - Ensure session file is properly uploaded
   - Check API_ID and API_HASH are correct
   - Verify Telegram account is authorized

4. **CORS Issues**:
   - Update CORS origins in backend configuration
   - Check frontend API base URLs

### Logs and Monitoring

- Access logs in Render dashboard
- Use health check endpoints for monitoring
- Set up alerts for service failures

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **Database Security**: Use strong passwords and proper user permissions
3. **API Security**: Implement rate limiting and authentication
4. **Session Management**: Secure storage of Telegram session files

## Support

If you encounter issues:
1. Check Render documentation
2. Review service logs
3. Test locally first
4. Contact support if needed

---

**Service URLs**:
- Backend: `https://kol-tracker-backend.onrender.com`
- Telethon: `https://kol-tracker-telethon.onrender.com`
- Health Checks: `/api` and `/health` respectively 