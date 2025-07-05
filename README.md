# 🚀 KOL Tracker Pro

A comprehensive KOL (Key Opinion Leader) tracking application for the crypto space with real-time analytics, bot detection, and volume tracking.

## 📋 Features

- **Dashboard** - Overview of KOL activities and market insights
- **KOL Analyzer** - Track and analyze KOL performance with AI insights
- **Channel Scanner** - Scan Telegram channels for KOL activities
- **Volume Tracker** - Monitor trading volumes and call performance
- **Bot Detector** - AI-powered bot detection for Telegram accounts
- **Leaderboard** - Ranked KOL performance metrics
- **Games** - Interactive trading games

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: NestJS + MongoDB + WebSocket
- **Telethon Service**: FastAPI + Python + Telethon
- **Database**: MongoDB

## 📦 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://python.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd kol-tracker-pro
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Set Up Python Environment

```bash
# Navigate to telethon service
cd backend/telethon_service

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
cd ../..
```

### 4. Set Up Environment Variables

Create a `.env` file in the `backend/telethon_service` directory:

```bash
# backend/telethon_service/.env
API_ID=your_telegram_api_id
API_HASH=your_telegram_api_hash
SESSION_NAME=telegram_session
MONGODB_URI=mongodb://localhost:27017/kol_tracker
```

**To get Telegram API credentials:**
1. Go to https://my.telegram.org/
2. Log in with your phone number
3. Go to "API Development Tools"
4. Create a new application
5. Copy the `API_ID` and `API_HASH`

### 5. Start MongoDB

```bash
# Start MongoDB service
# On macOS with Homebrew:
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod

# On Windows:
# Start MongoDB service from Services panel or run:
# net start MongoDB
```

### 6. Run All Services

Open **3 separate terminals** and run:

**Terminal 1 - Backend (NestJS)**
```bash
cd backend
npm run start:dev
```
*Backend will run on http://localhost:3000*

**Terminal 2 - Telethon Service (Python)**
```bash
cd backend/telethon_service
# Activate virtual environment if not already active
source venv/bin/activate  # On macOS/Linux
# venv\Scripts\activate    # On Windows
python main.py
```
*Telethon service will run on http://localhost:8000*

**Terminal 3 - Frontend (React)**
```bash
npm run dev
```
*Frontend will run on http://localhost:5173*

## 🌐 Access the Application

Once all services are running, open your browser and go to:
**http://localhost:5173**

## 📱 Usage

1. **Dashboard** - View overall KOL analytics and market insights
2. **KOL Analyzer** - Add KOLs by their Telegram username to track their posts
3. **Volume Tracker** - Monitor trading volumes and call performance
4. **Bot Detector** - Analyze Telegram accounts for bot behavior
5. **Leaderboard** - View ranked KOL performance metrics

## 🔧 Development

### Project Structure

```
kol-tracker-pro/
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── services/          # API services
│   ├── contexts/          # React contexts
│   └── utils/             # Utility functions
├── backend/               # NestJS backend
│   ├── src/               # Backend source code
│   └── telethon_service/  # Python Telethon service
├── public/                # Static assets
└── README.md
```

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Backend:**
- `npm run start` - Start production server
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build the application

**Telethon Service:**
- `python main.py` - Start the Telethon service

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill processes on specific ports
   lsof -ti:3000 | xargs kill -9  # Backend
   lsof -ti:8000 | xargs kill -9  # Telethon
   lsof -ti:5173 | xargs kill -9  # Frontend
   ```

2. **MongoDB Connection Issues**
   - Ensure MongoDB is running
   - Check if the connection string is correct
   - Verify MongoDB is accessible on port 27017

3. **Python Dependencies Issues**
   ```bash
   # Reinstall dependencies
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Node.js Dependencies Issues**
   ```bash
   # Clear cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📝 Features Overview

### 🎯 KOL Analyzer
- Add KOLs by Telegram username
- Real-time post tracking
- AI-powered sentiment analysis
- Performance metrics and insights

### 📊 Volume Tracker
- Real-time volume monitoring
- Call performance tracking
- Multiple timeframe analysis
- KOL-specific volume correlation

### 🤖 Bot Detector
- AI-powered bot detection
- Comprehensive account analysis
- Risk assessment and recommendations
- Detailed reporting

### 🏆 Leaderboard
- Ranked KOL performance
- Multiple ranking categories
- Tier-based classification
- Performance trends

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Ensure all prerequisites are installed
3. Verify all services are running
4. Check the console for error messages

---

**Happy Tracking! 🚀** 