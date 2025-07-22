# KOL Tracker Development Guide

## Quick Start (Fixed Version)

### 🚀 Easy Setup
Run both services with one command:
```bash
./start-dev.sh
```

This script will:
- Clean up any port conflicts (ports 8000, 5173-5176)
- Start the Telethon backend service on port 8000
- Start the frontend with proper environment variables
- Handle graceful shutdown when you press Ctrl+C

### 📱 Manual Setup (Alternative)

If you prefer to run services manually:

#### 1. Start Backend Telethon Service
```bash
cd backend/telethon_service
python3 main.py
```
Wait for: `INFO: Uvicorn running on http://0.0.0.0:8000`

#### 2. Start Frontend (in new terminal)
```bash
VITE_TELETHON_SERVICE_URL=http://localhost:8000 npm run dev
```

### 🔧 Environment Configuration

The frontend needs to know where the Telethon service is running. You can:

1. **Use the startup script** (recommended) - handles this automatically
2. **Set environment variable manually**:
   ```bash
   export VITE_TELETHON_SERVICE_URL=http://localhost:8000
   npm run dev
   ```
3. **Create .env.local file**:
   ```
   VITE_TELETHON_SERVICE_URL=http://localhost:8000
   ```

### 🐛 Fixed Issues

✅ **JSX Syntax Errors**: Fixed malformed JSX in ChannelScanner.tsx
✅ **Missing Export**: ChannelScanner component now properly exported
✅ **Authentication Flow**: Fixed 401 errors during scanning
✅ **Port Conflicts**: Automatic cleanup of conflicting processes
✅ **Environment Variables**: Proper Telethon service URL configuration
✅ **Error Handling**: Better error messages and retry functionality

### 📊 Testing the Scan Functionality

1. Open the app at `http://localhost:5173`
2. Navigate to "Channel Scanner"
3. Click "Connect Telegram" 
4. Enter your phone number and verify with OTP
5. Once authenticated, scan a channel:
   - Try: `btcgroupindia`
   - Or: `https://t.me/btcgroupindia`
   - Or any public Telegram channel

### 🔍 Troubleshooting

#### "Port already in use" errors
```bash
# Kill processes on conflicting ports
lsof -ti:8000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

#### Scan returns 401 Unauthorized
- Make sure you completed Telegram authentication first
- Check that localStorage contains `telegram_user_id`
- Try refreshing the page and re-authenticating

#### Backend not connecting
- Verify MongoDB is running (if required)
- Check that API_ID and API_HASH are set in backend/.env
- Ensure Python dependencies are installed:
  ```bash
  cd backend/telethon_service
  pip install -r requirements.txt
  ```

#### Frontend build errors
```bash
# Clear cache and reinstall
rm -rf node_modules/.vite
npm install
```

### 🎯 Architecture

```
Frontend (React + Vite) :5173
    ↓ HTTP requests
Backend Telethon Service :8000
    ↓ Telethon API
Telegram Servers
```

The scan flow:
1. User authenticates with Telegram via Telethon service
2. Frontend stores user session ID
3. Scan requests include user_id parameter
4. Backend uses user-specific Telegram client for scanning
5. Results returned with channel data and KOL information

### 📝 Key Files Modified

- `src/components/ChannelScanner.tsx` - Fixed JSX errors and authentication
- `src/contexts/TelegramAuthContext.tsx` - Enhanced user ID management 
- `start-dev.sh` - New development startup script
- `backend/telethon_service/main.py` - Scan endpoint with user authentication

### 🎉 Success Indicators

- ✅ No console errors on startup
- ✅ "Channel Scanner" page loads without errors
- ✅ Authentication flow completes successfully 
- ✅ Scan returns channel data instead of 401 errors
- ✅ Export functionality works
- ✅ Real-time activity and KOL data displayed

---

**Need help?** Check the terminal output for detailed error messages and refer to the troubleshooting section above. 