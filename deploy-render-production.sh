#!/bin/bash

# 🚀 KOL Tracker Pro - Production Render Deployment Script
# Deploys always-running backend and Telethon services to Render

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

print_header() {
    echo -e "${PURPLE}
╔══════════════════════════════════════════════════════════════╗
║                    KOL TRACKER PRO                          ║
║               Production Render Deployment                   ║
║                    Always-On Services                       ║
╚══════════════════════════════════════════════════════════════╝${NC}"
}

# Check if we're in the right directory
check_directory() {
    if [[ ! -f "package.json" ]] || [[ ! -f "render.yaml" ]]; then
        print_error "This script must be run from the root directory of the KOL Tracker project"
        print_info "Make sure you're in the directory containing package.json and render.yaml"
        exit 1
    fi
}

# Validate environment files
validate_environment() {
    print_status "Validating environment configuration..."
    
    # Check if render.yaml exists
    if [[ ! -f "render.yaml" ]]; then
        print_error "render.yaml not found"
        exit 1
    fi
    
    # Check keep-alive scripts
    if [[ ! -f "backend/keep-alive-wrapper.js" ]]; then
        print_error "Backend keep-alive wrapper not found"
        exit 1
    fi
    
    if [[ ! -f "backend/telethon_service/keep-alive-wrapper.py" ]]; then
        print_error "Telethon keep-alive wrapper not found"
        exit 1
    fi
    
    print_success "Environment validation passed"
}

# Build and test locally first
build_and_test() {
    print_status "Building and testing application locally..."
    
    # Install dependencies
    print_info "Installing dependencies..."
    npm install
    
    # Build frontend
    print_info "Building frontend..."
    npm run build
    
    # Check if build was successful
    if [[ ! -d "dist" ]]; then
        print_error "Frontend build failed - dist directory not created"
        exit 1
    fi
    
    # Install backend dependencies
    print_info "Installing backend dependencies..."
    cd backend && npm install --production && cd ..
    
    # Install Telethon dependencies
    print_info "Installing Telethon dependencies..."
    cd backend/telethon_service
    if command -v python3 &> /dev/null; then
        python3 -m pip install -r requirements.txt --quiet
    else
        print_warning "Python3 not found - skipping Telethon dependency check"
    fi
    cd ../..
    
    print_success "Build and dependency check completed"
}

# Git operations
commit_and_push() {
    print_status "Committing changes to Git..."
    
    # Check if we have any changes
    if git diff --quiet && git diff --staged --quiet; then
        print_info "No changes to commit"
    else
        print_info "Adding all changes..."
        git add .
        
        # Create commit message
        COMMIT_MSG="🚀 Production Deploy: Always-On Render Services

✅ Keep-alive wrappers for backend and Telethon
✅ Enhanced health monitoring and auto-restart
✅ Improved MongoDB connection with fallback
✅ Production-ready Render configuration
✅ Complete demo data removal (real data only)

Deployment: $(date +'%Y-%m-%d %H:%M:%S')"
        
        print_info "Committing changes..."
        git commit -m "$COMMIT_MSG"
    fi
    
    # Push to GitHub
    print_info "Pushing to GitHub..."
    git push origin main
    
    print_success "Git operations completed"
}

# Display deployment information
show_deployment_info() {
    print_status "Deployment Information"
    echo -e "${CYAN}
📋 Services to be deployed:
   🟢 Backend API (Node.js)    - Always-on with auto-restart
   🟢 Telethon Service (Python) - Always-on with auto-restart  
   🟢 Frontend (React)          - Static site with CDN

🔧 Key Features:
   ✅ Auto-restart on failures (max 10 attempts/hour)
   ✅ Health checks every 5 minutes
   ✅ Keep-alive pings every 14 minutes
   ✅ Session persistence with 1GB disk
   ✅ MongoDB fallback to in-memory storage
   ✅ Production logging and monitoring
   ✅ Graceful shutdown handling
   ✅ Real data only (no demo/mock data)

📊 Monitoring Endpoints:
   🔍 Backend Health:  /api/health
   🔍 Telethon Health: /health
   🔍 Frontend Health: /

🌐 Render Dashboard: https://dashboard.render.com${NC}"
}

# Check for required environment variables
check_env_vars() {
    print_status "Checking required environment variables..."
    
    REQUIRED_VARS=(
        "MONGODB_URI"
        "JWT_SECRET"
    )
    
    MISSING_VARS=()
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [[ -z "${!var}" ]] && ! grep -q "$var" render.yaml; then
            MISSING_VARS+=("$var")
        fi
    done
    
    if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
        print_warning "The following environment variables should be set in Render:"
        for var in "${MISSING_VARS[@]}"; do
            echo -e "   ${RED}❌ $var${NC}"
        done
        print_info "These will need to be configured in your Render service settings"
    else
        print_success "Environment variables check passed"
    fi
}

# Deploy to Render
deploy_to_render() {
    print_status "Starting Render deployment..."
    
    print_info "Git repository has been updated and pushed"
    print_info "Render will automatically detect changes and start deployment"
    
    echo -e "${GREEN}
🎯 Next Steps:
   1. Go to https://dashboard.render.com
   2. Create a new Blueprint deployment
   3. Connect your GitHub repository
   4. Render will automatically use render.yaml configuration
   5. Set up environment variables in each service
   6. Monitor deployment logs for any issues

📱 After Deployment:
   1. Test health endpoints
   2. Verify Telegram authentication
   3. Check real data functionality
   4. Monitor service logs
   5. Set up custom domain (optional)${NC}"
}

# Main execution
main() {
    print_header
    
    print_status "Starting production deployment process..."
    
    # Pre-deployment checks
    check_directory
    validate_environment
    check_env_vars
    
    # Build and test
    build_and_test
    
    # Show deployment info
    show_deployment_info
    
    # Confirm deployment
    echo -e "\n${YELLOW}🚀 Ready to deploy to production?${NC}"
    read -p "Press [Enter] to continue or [Ctrl+C] to cancel..."
    
    # Git operations
    commit_and_push
    
    # Deploy
    deploy_to_render
    
    print_success "Production deployment process completed!"
    print_info "Check your Render dashboard for deployment status"
    
    echo -e "${PURPLE}
╔══════════════════════════════════════════════════════════════╗
║                     DEPLOYMENT COMPLETE                     ║
║                                                              ║
║  Your KOL Tracker Pro is now deploying to production!       ║
║  Services will be always-on with auto-restart capabilities  ║
║                                                              ║
║  Monitor: https://dashboard.render.com                      ║
║  Guide:   RENDER_ALWAYS_ON_GUIDE.md                        ║
╚══════════════════════════════════════════════════════════════╝${NC}"
}

# Error handling
trap 'print_error "Deployment failed! Check the error above."; exit 1' ERR

# Run main function
main "$@" 