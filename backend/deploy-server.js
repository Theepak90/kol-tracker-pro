const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOrigins = [
  'http://localhost:5173',
  'http://localhost:5174', 
  'http://localhost:5175',
  'http://localhost:5176',
  'https://kol-tracker-pro.vercel.app'
];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'KOL Tracker API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'KOL Tracker API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    uptime: process.uptime()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'kol-tracker-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Basic API endpoints for deployment
app.get('/api/kols', (req, res) => {
  res.json([]);
});

app.get('/api/telegram-status', (req, res) => {
  res.json({
    connected: false,
    status: 'offline',
    message: 'Telegram service not available in deployment mode',
    lastCheck: new Date().toISOString(),
    service: 'telethon'
  });
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 KOL Tracker API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api`);
  console.log(`🔗 Frontend: https://kol-tracker-pro.vercel.app`);
  console.log('🎯 Deployment mode - simplified backend');
});

module.exports = app; 