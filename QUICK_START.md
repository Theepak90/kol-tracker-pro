# 🚀 Quick Start Guide

## For Your Friend - Get KOL Tracker Pro Running in 5 Minutes!

### Prerequisites (Install These First)
1. **Node.js** - Download from https://nodejs.org/
2. **Python** - Download from https://python.org/
3. **MongoDB** - Download from https://www.mongodb.com/try/download/community

### Step 1: Get Telegram API Credentials
1. Go to https://my.telegram.org/
2. Log in with your phone number
3. Go to "API Development Tools"
4. Create a new application
5. Copy the `API_ID` and `API_HASH` (you'll need these later)

### Step 2: Setup Project
```bash
# Clone/extract the project
cd kol-tracker-pro

# Run the setup script (this installs everything)
./setup.sh

# OR if you prefer npm:
npm run setup
```

### Step 3: Configure Telegram API
```bash
# Edit the environment file
nano backend/telethon_service/.env

# Replace with your actual values:
API_ID=your_api_id_here
API_HASH=your_api_hash_here
```

### Step 4: Start MongoDB
```bash
# macOS (with Homebrew):
brew services start mongodb-community

# Linux:
sudo systemctl start mongod

# Windows:
net start MongoDB
```

### Step 5: Start All Services
```bash
# This starts everything at once!
./start.sh

# OR using npm:
npm run start-all
```

### Step 6: Open the App
Open your browser and go to: **http://localhost:5173**

---

## 🎯 That's It!

You should now see:
- ✅ Frontend running on http://localhost:5173
- ✅ Backend API on http://localhost:3000
- ✅ Telethon service on http://localhost:8000

## 🛑 To Stop Everything
```bash
./stop.sh
# OR
npm run stop-all
```

## 🆘 Having Issues?

### Common Problems:
1. **Port already in use** - Run `./stop.sh` first
2. **MongoDB not running** - Start MongoDB service
3. **Python errors** - Make sure Python 3.8+ is installed
4. **Node.js errors** - Make sure Node.js 18+ is installed

### Need Help?
- Check the full README.md for detailed instructions
- Make sure all prerequisites are installed
- Verify your Telegram API credentials are correct

---

**Happy KOL Tracking! 🚀** 