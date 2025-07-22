#!/bin/bash

echo "🚀 KOL Tracker Pro - Render Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo -e "${RED}❌ Render CLI not found${NC}"
    echo -e "${YELLOW}Installing Render CLI...${NC}"
    
    # Install Render CLI based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install render
        else
            echo -e "${RED}Please install Homebrew first: https://brew.sh${NC}"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -fsSL https://cli.render.com/install | sh
    else
        echo -e "${RED}Please install Render CLI manually: https://render.com/docs/cli${NC}"
    exit 1
    fi
fi

echo -e "${GREEN}✅ Render CLI found${NC}"

# Check if user is logged in
if ! render auth whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️ Not logged in to Render${NC}"
    echo -e "${BLUE}Please login to Render:${NC}"
    render auth login
fi

echo -e "${GREEN}✅ Logged in to Render${NC}"

# Pre-deployment checklist
echo ""
echo -e "${BLUE}📋 Pre-deployment Checklist:${NC}"
echo ""

# Check environment files
ENV_FILES=(
    "render-backend-env.txt"
    "render-telethon-env.txt"
    "render-frontend-env.txt"
)

for file in "${ENV_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo -e "${GREEN}✅ $file found${NC}"
    else
        echo -e "${YELLOW}⚠️ $file not found - will use render.yaml defaults${NC}"
    fi
done

# Check critical files
CRITICAL_FILES=(
    "backend/simple-server.js"
    "backend/render-start.js"
    "backend/telethon_service/main.py"
    "backend/telethon_service/render-start.py"
    "backend/telethon_service/requirements.txt"
    "render.yaml"
)

echo ""
echo -e "${BLUE}🔍 Checking critical files:${NC}"
for file in "${CRITICAL_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
        exit 1
    fi
done

# Make startup scripts executable
chmod +x backend/render-start.js
chmod +x backend/telethon_service/render-start.py

echo ""
echo -e "${BLUE}🚀 Starting deployment...${NC}"

# Deploy using render.yaml
if render deploy; then
    echo ""
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo ""
    echo -e "${BLUE}📱 Your services will be available at:${NC}"
    echo -e "${GREEN}• Backend API: https://kol-tracker-backend.onrender.com${NC}"
    echo -e "${GREEN}• Telethon Service: https://kol-tracker-telethon.onrender.com${NC}"
    echo -e "${GREEN}• Frontend: https://kol-tracker-frontend.onrender.com${NC}"
    echo ""
    echo -e "${YELLOW}⏱️ Note: Services may take 5-10 minutes to fully start up${NC}"
    echo ""
    echo -e "${BLUE}🔧 Useful commands:${NC}"
    echo -e "• Check service status: ${GREEN}render ps${NC}"
    echo -e "• View logs: ${GREEN}render logs <service-name>${NC}"
    echo -e "• Update deployment: ${GREEN}render deploy${NC}"
    echo ""
    echo -e "${BLUE}📖 Service URLs for frontend configuration:${NC}"
    echo -e "• Update your frontend API configuration to use:"
    echo -e "  - API_BASE_URL: https://kol-tracker-backend.onrender.com"
    echo -e "  - TELETHON_BASE_URL: https://kol-tracker-telethon.onrender.com"
    echo ""
    echo -e "${BLUE}🔑 First Time Setup:${NC}"
    echo -e "1. Go to: https://kol-tracker-frontend.onrender.com"
    echo -e "2. Navigate to Bot Detector"
    echo -e "3. Click 'Connect Telegram' to authenticate"
    echo -e "4. Follow the authentication process"
    echo ""
else
echo ""
    echo -e "${RED}❌ Deployment failed${NC}"
    echo -e "${YELLOW}💡 Troubleshooting:${NC}"
    echo -e "• Check render.yaml syntax: ${GREEN}render validate${NC}"
    echo -e "• View deployment logs: ${GREEN}render logs${NC}"
    echo -e "• Ensure all environment variables are set correctly"
    exit 1
fi 