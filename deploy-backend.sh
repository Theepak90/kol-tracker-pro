#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Deploying backend services to Render...${NC}"

# Check if render-cli is installed
if ! command -v render &> /dev/null; then
    echo -e "${RED}render-cli is not installed. Please install it first:${NC}"
    echo "npm install -g @render/cli"
    exit 1
fi

# Check if user is logged in to Render
if ! render whoami &> /dev/null; then
    echo -e "${RED}Please log in to Render first:${NC}"
    echo "render login"
    exit 1
fi

# Deploy backend service
echo -e "\n${GREEN}Deploying NestJS backend...${NC}"
render deploy --yaml render.yaml --service kolnexus-backend

# Deploy Telethon service
echo -e "\n${GREEN}Deploying Telethon service...${NC}"
render deploy --yaml render.yaml --service kolnexus-telethon

echo -e "\n${GREEN}Deployment initiated! Check the Render dashboard for progress.${NC}"
echo -e "Backend: https://kolnexus-backend.onrender.com"
echo -e "Telethon: https://kolnexus-telethon.onrender.com" 