# KOL Tracker Pro - 24/7 Service Setup Guide

This guide will help you set up and manage the KOL Tracker Pro application to run 24/7 using PM2 process manager.

## 🚀 Quick Start

### 1. First-time Setup

```bash
# 1. Setup Telegram authentication
./setup-auth.sh

# 2. Start all services
./start-services.sh
```

### 2. Service Management

```bash
# Show service status
./manage-services.sh status

# Stop all services
./manage-services.sh stop

# Restart all services
./manage-services.sh restart

# View logs
./manage-services.sh logs

# Monitor services in real-time
./manage-services.sh monitor
```

## 📋 Services Overview

The application consists of three main services:

1. **Backend (NestJS)** - Port 3000
   - REST API server
   - Database operations
   - Authentication handling

2. **Telethon Service (Python)** - Port 8000
   - Telegram API integration
   - Channel scanning
   - Real-time updates

3. **Frontend (React/Vite)** - Port 5173
   - User interface
   - Real-time updates
   - Interactive dashboard

## 🔧 Detailed Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Python 3.7+ installed
- PM2 installed globally (`npm install -g pm2`)
- Telegram API credentials (API_ID and API_HASH)

### Step 1: Telegram Authentication

Before starting the services, you need to authenticate with Telegram:

```bash
./setup-auth.sh
```

This will:
- Clean up any existing session files
- Prompt for your phone number
- Ask for the verification code sent to your phone
- Save the authenticated session

### Step 2: Start Services

```bash
./start-services.sh
```

This will:
- Kill any existing processes on required ports
- Start all services using PM2
- Set up automatic restart on system boot
- Display service status and URLs

### Step 3: Verify Services

Check that all services are running:

```bash
./manage-services.sh status
```

You should see:
- ✅ Frontend: http://localhost:5173
- ✅ Backend: http://localhost:3000
- ✅ Telethon: http://localhost:8000

## 🛠️ Service Management Commands

### Basic Commands

```bash
# Start all services
./manage-services.sh start

# Stop all services
./manage-services.sh stop

# Restart all services
./manage-services.sh restart

# Show service status
./manage-services.sh status
```

### Monitoring & Logs

```bash
# Show all logs
./manage-services.sh logs

# Show backend logs only
./manage-services.sh logs-be

# Show telethon logs only
./manage-services.sh logs-tel

# Show frontend logs only
./manage-services.sh logs-fe

# Real-time monitoring
./manage-services.sh monitor
```

### Maintenance

```bash
# Clean up and reset all services
./manage-services.sh cleanup

# Re-setup authentication
./manage-services.sh auth

# Show help
./manage-services.sh help
```

## 🔄 Automatic Restart Features

PM2 provides several automatic restart features:

1. **Auto-restart on crash** - Services automatically restart if they crash
2. **Memory limit restart** - Services restart if they exceed memory limits
3. **System boot startup** - Services start automatically when the system boots
4. **Max restart limit** - Prevents infinite restart loops

## 📊 Monitoring

### PM2 Dashboard

```bash
# Real-time monitoring dashboard
pm2 monit
```

### Service Status

```bash
# Check service status
pm2 status

# Show detailed info
pm2 show kol-backend
pm2 show kol-telethon
pm2 show kol-frontend
```

### Logs

```bash
# View logs
pm2 logs

# View specific service logs
pm2 logs kol-backend
pm2 logs kol-telethon
pm2 logs kol-frontend

# View error logs only
pm2 logs --err

# Follow logs in real-time
pm2 logs --follow
```

## 🔧 Configuration

### PM2 Configuration

The PM2 configuration is in `ecosystem.config.js`:

- **Backend**: NestJS development server with hot reload
- **Telethon**: Python service with Telegram API integration
- **Frontend**: Vite development server with hot reload

### Environment Variables

Telethon service uses these environment variables:
- `API_ID`: Telegram API ID
- `API_HASH`: Telegram API Hash
- `SESSION_NAME`: Session file name
- `PORT`: Service port (default: 8000)

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   ./manage-services.sh cleanup
   ./manage-services.sh start
   ```

2. **Telethon authentication failed**
   ```bash
   ./manage-services.sh auth
   ```

3. **Service won't start**
   ```bash
   ./manage-services.sh logs-[service]
   ```

### Health Checks

```bash
# Check if services are responding
curl http://localhost:3000/api
curl http://localhost:8000/health
curl http://localhost:5173
```

## 🔐 Security Considerations

1. **Session Files**: Keep `telegram_session.session` secure
2. **API Keys**: Don't commit API keys to version control
3. **Firewall**: Configure firewall rules for production
4. **SSL**: Use HTTPS in production environments

## 📈 Performance Optimization

1. **Memory Limits**: Adjust memory limits in `ecosystem.config.js`
2. **Process Instances**: Scale services by increasing instances
3. **Log Rotation**: Configure log rotation to prevent disk space issues

## 🔄 Updates and Maintenance

### Updating Code

```bash
# Stop services
./manage-services.sh stop

# Pull latest code
git pull origin main

# Install dependencies
npm install
cd backend && npm install
cd ../backend/telethon_service && pip install -r requirements.txt

# Start services
./manage-services.sh start
```

### Backup

Important files to backup:
- `backend/telethon_service/telegram_session.session`
- `backend/telethon_service/.env`
- Database files
- Configuration files

## 📞 Support

If you encounter issues:

1. Check the logs: `./manage-services.sh logs`
2. Verify service status: `./manage-services.sh status`
3. Try cleanup and restart: `./manage-services.sh cleanup && ./manage-services.sh start`

## 🎯 Next Steps

Once your services are running 24/7:

1. Set up monitoring alerts
2. Configure backup schedules
3. Set up SSL certificates for production
4. Configure reverse proxy (nginx/Apache)
5. Set up database backups 