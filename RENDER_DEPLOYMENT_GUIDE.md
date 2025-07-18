# 🚀 Render Deployment Guide - KOL Tracker Pro

## ✅ Fixed Issues

The deployment build failure has been resolved by:

1. **Moved `@nestjs/cli` to dependencies** - Now available during production build
2. **Moved `typescript` to dependencies** - Required for NestJS compilation
3. **Updated build scripts** - Use `npx` to run NestJS CLI commands
4. **Created alternative build commands** - Multiple fallback options

## 🔧 Changes Made

### Backend Package.json Updates
```json
{
  "dependencies": {
    "@nestjs/cli": "^10.4.9",
    "typescript": "^5.1.3",
    // ... other dependencies
  },
  "scripts": {
    "build": "npx nest build",
    "build:alt": "npx @nestjs/cli build"
  }
}
```

### Root Package.json Updates
```json
{
  "scripts": {
    "build": "chmod +x build.sh && ./build.sh",
    "render:build": "chmod +x build.sh && ./build.sh"
  }
}
```

## 🚀 Deployment Steps

### Option 1: Use Render Dashboard (Recommended)

1. **Create Web Service:**
   - Name: `kol-tracker-pro`
   - Environment: `Node`
   - Build Command: `npm install && npm run build:frontend && cd backend && npm install --legacy-peer-deps && npx nest build`
   - Start Command: `node backend/dist/main.js`

2. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB=kol-tracker-pro
   JWT_SECRET=your_jwt_secret_here
   ```

### Option 2: Use render.yaml

1. **Commit the render.yaml file** to your repository
2. **Connect your GitHub repository** to Render
3. **Environment variables will be auto-configured** from the render.yaml

### Option 3: Manual Build Commands

If the automated build fails, try these manual commands:

```bash
# Frontend build
npm install
npm run build:frontend

# Backend build
cd backend
npm install --legacy-peer-deps
npx @nestjs/cli build

# Start
node dist/main.js
```

## 🔍 Troubleshooting

### Build Failures

1. **"nest: not found"**
   - ✅ **FIXED**: Moved `@nestjs/cli` to dependencies
   - Alternative: Use `npx nest build` or `npx @nestjs/cli build`

2. **"typescript: not found"**
   - ✅ **FIXED**: Moved `typescript` to dependencies

3. **Dependencies issues**
   - Use `npm install --legacy-peer-deps` for backend
   - Ensure all build tools are in `dependencies`, not `devDependencies`

### Runtime Issues

1. **Port binding**
   - Render uses `PORT` environment variable (typically 10000)
   - Make sure your app listens on `process.env.PORT`

2. **Static files**
   - Frontend files should be served from `dist/` folder
   - Backend should serve static files using `@nestjs/serve-static`

## 📝 Environment Variables

### Required Variables:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
MONGODB_DB=kol-tracker-pro
JWT_SECRET=your-super-secret-jwt-key-here
```

### Optional Variables:
```
API_ID=your_telegram_api_id
API_HASH=your_telegram_api_hash
SESSION_NAME=telegram_session
```

## 🌐 URLs After Deployment

- **Main Application**: `https://your-app-name.onrender.com`
- **API Endpoints**: `https://your-app-name.onrender.com/api`
- **Health Check**: `https://your-app-name.onrender.com/api/health`

## 📱 Testing the Deployment

1. **Frontend**: Visit your Render URL
2. **Backend API**: Test `https://your-app.onrender.com/api`
3. **Database**: Check MongoDB connection in logs
4. **JWT**: Test authentication endpoints

## 🔄 Redeployment

After making changes:
1. **Push to GitHub** - Render will auto-deploy
2. **Manual deploy** - Use Render dashboard
3. **Force rebuild** - Clear build cache if needed

## 📞 Support

If deployment still fails:

1. **Check Render logs** for specific error messages
2. **Verify environment variables** are set correctly
3. **Test locally** with production build: `npm run build && npm start`
4. **Clear build cache** on Render if necessary

The build should now work! 🎉 