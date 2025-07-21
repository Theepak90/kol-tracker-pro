#!/bin/bash

# ==========================================
# KOL Tracker Pro - Production Deployment Script
# Domain: kolopz.com
# ==========================================

set -e  # Exit on any error

echo "🚀 Starting KOL Tracker Pro Production Deployment"
echo "🌐 Target Domain: kolopz.com"
echo "📅 $(date)"
echo

# Color definitions for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if git is available
if ! command -v git &> /dev/null; then
    print_error "Git is required but not installed"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is required but not installed"
    exit 1
fi

print_status "Prerequisites check completed"

# Ensure we're in the project root
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Update production API configuration
echo
echo "🔧 Updating production API configuration..."

# Use the production URL restoration script
if [ -f "restore-production-urls.js" ]; then
    node restore-production-urls.js
    print_status "Production URLs configured for kolopz.com"
else
    print_warning "restore-production-urls.js not found, manually updating config..."
    
    # Manual update of API configuration
    cat > src/config/api.ts << 'EOF'
// Production API Configuration for kolopz.com
const isDevelopment = import.meta.env.DEV;

// Production URLs - Custom domain deployment
const PROD_BACKEND_URL = import.meta.env.VITE_API_URL || 'https://api.kolopz.com';
const PROD_TELETHON_URL = import.meta.env.VITE_TELETHON_SERVICE_URL || 'https://telethon.kolopz.com';
const PROD_WS_URL = import.meta.env.VITE_WS_ENDPOINT || 'wss://api.kolopz.com';

// Local development URLs
const DEV_BACKEND_URL = 'http://localhost:3000';
const DEV_TELETHON_URL = 'http://localhost:8000';
const DEV_WS_URL = 'ws://localhost:3000';

// Export the appropriate URLs based on environment
export const API_BASE_URL = isDevelopment ? DEV_BACKEND_URL : PROD_BACKEND_URL;
export const TELETHON_BASE_URL = isDevelopment ? DEV_TELETHON_URL : PROD_TELETHON_URL;
export const WS_BASE_URL = isDevelopment ? DEV_WS_URL : PROD_WS_URL;

export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/api/auth`,
  kols: `${API_BASE_URL}/api/kols`,
  botDetection: `${API_BASE_URL}/api/bot-detection`,
  health: `${API_BASE_URL}/api`,
  telegram: {
    auth: `${TELETHON_BASE_URL}/auth`,
    scan: `${TELETHON_BASE_URL}/scan`,
    health: `${TELETHON_BASE_URL}/health`
  }
};
EOF
    print_status "API configuration updated manually"
fi

# Build the frontend
echo
echo "🏗️  Building frontend for production..."
npm install
npm run build

if [ $? -eq 0 ]; then
    print_status "Frontend build completed successfully"
else
    print_error "Frontend build failed"
    exit 1
fi

# Build backend
echo
echo "🔧 Preparing backend for production..."
cd backend
npm install

if [ $? -eq 0 ]; then
    print_status "Backend dependencies installed successfully"
else
    print_error "Backend dependency installation failed"
    exit 1
fi
cd ..

# Create production environment files
echo
echo "📝 Creating production environment templates..."

# Frontend environment
cat > .env.production << 'EOF'
# Frontend Production Environment for kolopz.com
VITE_API_URL=https://api.kolopz.com
VITE_TELETHON_SERVICE_URL=https://telethon.kolopz.com
VITE_WS_ENDPOINT=wss://api.kolopz.com
VITE_ENVIRONMENT=production
EOF

print_status "Production environment files created"

# Generate deployment checklist
echo
echo "📋 Generating deployment checklist..."

cat > PRODUCTION_DEPLOYMENT_CHECKLIST.md << 'EOF'
# Production Deployment Checklist for kolopz.com

## ✅ Pre-Deployment Steps Completed
- [x] Frontend built for production
- [x] Backend dependencies installed
- [x] API configuration updated for kolopz.com
- [x] Environment files created

## 🚀 Deployment Steps Required

### 1. Backend Deployment (api.kolopz.com)
- [ ] Deploy backend to Render service
- [ ] Configure custom domain: api.kolopz.com
- [ ] Set environment variables from `render-backend-env.txt`
- [ ] Verify health check: https://api.kolopz.com/api

### 2. Telethon Service Deployment (telethon.kolopz.com)
- [ ] Deploy telethon service to Render
- [ ] Configure custom domain: telethon.kolopz.com
- [ ] Set environment variables from `render-telethon-env.txt`
- [ ] Configure persistent disk for session storage
- [ ] Verify health check: https://telethon.kolopz.com/health

### 3. Frontend Deployment (kolopz.com)
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Configure custom domain: kolopz.com
- [ ] Set environment variables from `.env.production`
- [ ] Verify deployment: https://kolopz.com

### 4. DNS Configuration
- [ ] api.kolopz.com → Points to Render backend service
- [ ] telethon.kolopz.com → Points to Render telethon service  
- [ ] kolopz.com → Points to frontend deployment

### 5. SSL Configuration
- [ ] SSL certificates configured for all subdomains
- [ ] Force HTTPS redirects enabled
- [ ] Mixed content warnings resolved

### 6. Testing
- [ ] End-to-end functionality test
- [ ] Real Telegram data integration test
- [ ] Cross-browser compatibility test
- [ ] Mobile responsiveness test

## 📞 Support
If you encounter issues during deployment, check:
1. Environment variable configuration
2. DNS propagation status
3. Service health endpoints
4. Browser developer console for errors
EOF

print_status "Deployment checklist created"

# Test the build
echo
echo "🧪 Testing production build..."

# Check if dist directory exists and has content
if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
    print_status "Production build files verified"
    echo "   📁 Build size: $(du -sh dist | cut -f1)"
    echo "   📄 Files: $(find dist -type f | wc -l) files generated"
else
    print_error "Production build verification failed"
    exit 1
fi

# Final summary
echo
echo "🎉 Production deployment preparation completed!"
echo
echo "📊 Summary:"
echo "   ✅ Frontend built and ready for deployment"
echo "   ✅ Backend configured for production"
echo "   ✅ API URLs configured for kolopz.com"
echo "   ✅ Environment templates created"
echo "   ✅ Deployment checklist generated"
echo
echo "🌐 Next Steps:"
echo "   1. Review PRODUCTION_DEPLOYMENT_CHECKLIST.md"
echo "   2. Deploy backend to: https://api.kolopz.com"
echo "   3. Deploy telethon to: https://telethon.kolopz.com"
echo "   4. Deploy frontend to: https://kolopz.com"
echo "   5. Configure DNS and SSL certificates"
echo
echo "🔗 Environment Files:"
echo "   📄 Frontend: .env.production"
echo "   📄 Backend: render-backend-env.txt"
echo "   📄 Telethon: render-telethon-env.txt"
echo
print_status "Ready for production deployment to kolopz.com! 🚀" 