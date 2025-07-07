const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');
const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://localhost:5175',
      'http://localhost:5176',
      'https://kol-tracker-pro.vercel.app'
    ],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["my-custom-header"]
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  path: '/socket.io/',
  serveClient: false,
  cookie: false
});

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kol_tracker';
let db;

// In-memory storage (for development without MongoDB)
let users = [];
let userIdCounter = 1;

// In-memory storage
const gameRooms = new Map();
const activeConnections = new Map(); // socketId -> userId

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [
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

// Additional CORS middleware for better compatibility
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (corsOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

app.use(express.json());

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'KOL Tracker API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Additional health endpoint for consistency
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'KOL Tracker API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Root health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'kol-tracker-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Telegram service status check
app.get('/api/telegram-status', async (req, res) => {
  try {
    const telethonUrl = process.env.TELETHON_URL || 'http://localhost:8000';
    const response = await fetch(`${telethonUrl}/health`, {
      timeout: 5000
    });
    
    if (response.ok) {
      const healthData = await response.json();
      res.json({
        connected: true,
        status: 'online',
        uptime: healthData.uptime || 'unknown',
        lastCheck: new Date().toISOString(),
        service: 'telethon'
      });
    } else {
      res.json({
        connected: false,
        status: 'service_error',
        lastCheck: new Date().toISOString(),
        service: 'telethon'
      });
    }
  } catch (error) {
    res.json({
      connected: false,
      status: 'offline',
      error: error.message,
      lastCheck: new Date().toISOString(),
      service: 'telethon'
    });
  }
});

// Get all KOLs
app.get('/api/kols', async (req, res) => {
  try {
    if (db) {
      const kols = await db.collection('kols').find({}).toArray();
      res.json(kols);
    } else {
      res.status(503).json({ error: 'Database not available' });
    }
  } catch (error) {
    console.error('Error fetching KOLs:', error);
    res.status(500).json({ error: 'Failed to fetch KOLs' });
  }
});

// Get specific KOL
app.get('/api/kols/:username', async (req, res) => {
  try {
    const { username } = req.params;
    if (db) {
      const kol = await db.collection('kols').findOne({ telegramUsername: username });
      if (kol) {
        res.json(kol);
      } else {
        res.status(404).json({ error: 'KOL not found' });
      }
    } else {
      res.status(503).json({ error: 'Database not available' });
    }
  } catch (error) {
    console.error('Error fetching KOL:', error);
    res.status(500).json({ error: 'Failed to fetch KOL' });
  }
});

// Create KOL
app.post('/api/kols', async (req, res) => {
  try {
    const kolData = {
      ...req.body,
      stats: {
        totalPosts: 0,
        totalViews: 0,
        totalForwards: 0,
        lastUpdated: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (db) {
      const result = await db.collection('kols').insertOne(kolData);
      res.json({ ...kolData, _id: result.insertedId });
    } else {
      res.json({ ...kolData, _id: 'mock' + Date.now() });
    }
  } catch (error) {
    console.error('Error creating KOL:', error);
    res.status(500).json({ error: 'Failed to create KOL' });
  }
});

// Update KOL
app.put('/api/kols/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    if (db) {
      await db.collection('kols').updateOne(
        { telegramUsername: username },
        { $set: updateData }
      );
    }
    
    res.json({ ...updateData, telegramUsername: username });
  } catch (error) {
    console.error('Error updating KOL:', error);
    res.status(500).json({ error: 'Failed to update KOL' });
  }
});

// Delete KOL
app.delete('/api/kols/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (db) {
      await db.collection('kols').deleteOne({ telegramUsername: username });
    }
    
    res.json({ message: 'KOL deleted successfully' });
  } catch (error) {
    console.error('Error deleting KOL:', error);
    res.status(500).json({ error: 'Failed to delete KOL' });
  }
});

// Fetch posts for a specific user/KOL
app.get('/api/kols/:username/posts', async (req, res) => {
  try {
    const { username } = req.params;
    const { limit = 50 } = req.query;
    
    // Try to fetch from Telethon service first
    try {
      const telethonUrl = process.env.TELETHON_URL || 'http://localhost:8000';
      const response = await fetch(`${telethonUrl}/user-posts/${username}?limit=${limit}`, {
        timeout: 10000
      });
      
      if (response.ok) {
        const posts = await response.json();
        
        // Store posts in database if available
        if (db && posts.length > 0) {
          await db.collection('user_posts').insertMany(
            posts.map(post => ({
              ...post,
              username,
              fetchedAt: new Date().toISOString()
            }))
          );
        }
        
        return res.json(posts);
      }
    } catch (telethonError) {
      console.log('Telethon service not available');
    }
    
    // Fallback to database
    if (db) {
      const posts = await db.collection('user_posts')
        .find({ username })
        .sort({ date: -1 })
        .limit(parseInt(limit))
        .toArray();
      
      if (posts.length > 0) {
        return res.json(posts);
      }
    }
    
    // No data available
    res.status(404).json({ 
      error: 'No posts found for this user. Telegram service unavailable and no cached data.' 
    });
    
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// AI Analysis for KOL
app.post('/api/kols/:username/analyze', async (req, res) => {
  try {
    const { username } = req.params;
    const { posts, analysisType = 'full' } = req.body;
    
    if (!posts || posts.length === 0) {
      return res.status(400).json({ error: 'No posts provided for analysis' });
    }
    
    // Perform real AI analysis here (integrate with actual AI service)
    // For now, return an error since we don't have real AI integration
    res.status(503).json({ 
      error: 'AI analysis service not available. Please integrate with a real AI service.' 
    });
    
  } catch (error) {
    console.error('Error performing AI analysis:', error);
    res.status(500).json({ error: 'Failed to perform analysis' });
  }
});

// Search KOLs from groups
app.get('/api/groups/:groupName/kols', async (req, res) => {
  try {
    const { groupName } = req.params;
    const { limit = 50 } = req.query;
    
    // Try to fetch from Telethon service
    try {
      const telethonUrl = process.env.TELETHON_URL || 'http://localhost:8000';
      const response = await fetch(`${telethonUrl}/scan/${groupName}`, {
        timeout: 15000
      });
      
      if (response.ok) {
        const scanResult = await response.json();
        
        // Extract KOLs from scan result
        const kols = scanResult.kols || [];
        
        // Store in database
        if (db && kols.length > 0) {
          await db.collection('discovered_kols').insertMany(
            kols.map(kol => ({
              ...kol,
              discoveredFrom: groupName,
              discoveredAt: new Date().toISOString()
            }))
          );
        }
        
        return res.json({
          success: true,
          groupName,
          kols: kols.slice(0, parseInt(limit)),
          totalFound: kols.length,
          stats: scanResult.stats || {}
        });
      }
    } catch (telethonError) {
      console.log('Telethon service not available');
    }
    
    // Check database for cached data
    if (db) {
      const cachedKols = await db.collection('discovered_kols')
        .find({ discoveredFrom: groupName })
        .sort({ discoveredAt: -1 })
        .limit(parseInt(limit))
        .toArray();
      
      if (cachedKols.length > 0) {
        return res.json({
          success: true,
          groupName,
          kols: cachedKols,
          totalFound: cachedKols.length,
          cached: true,
          message: 'Showing cached data - Telegram service unavailable'
        });
      }
    }
    
    // No data available
    res.status(503).json({
      success: false,
      error: 'Group scanning unavailable. Telegram service is not accessible and no cached data found.',
      groupName,
      kols: [],
      totalFound: 0
    });
    
  } catch (error) {
    console.error('Error scanning group for KOLs:', error);
    res.status(500).json({ error: 'Failed to scan group' });
  }
});

// Channel scanning endpoint
app.get('/api/scan/:channelName', async (req, res) => {
  try {
    const { channelName } = req.params;
    
    // Try to fetch from Telethon service
    try {
      const telethonUrl = process.env.TELETHON_URL || 'http://localhost:8000';
      const response = await fetch(`${telethonUrl}/scan/${channelName}`, {
        timeout: 15000
      });
      
      if (response.ok) {
        const scanResult = await response.json();
        
        // Store in database
        if (db) {
          await db.collection('channel_scans').insertOne({
            ...scanResult,
            channelName,
            scannedAt: new Date().toISOString()
          });
        }
        
        return res.json(scanResult);
      }
    } catch (telethonError) {
      console.log('Telethon service not available');
    }
    
    // Check database for cached data
    if (db) {
      const cachedScan = await db.collection('channel_scans')
        .findOne({ channelName }, { sort: { scannedAt: -1 } });
      
      if (cachedScan) {
        return res.json({
          ...cachedScan,
          cached: true,
          message: 'Showing cached data - Telegram service unavailable'
        });
      }
    }
    
    // No data available
    res.status(503).json({ 
      error: 'Channel scanning unavailable. Telegram service is not accessible and no cached data found.' 
    });
    
  } catch (error) {
    console.error('Error scanning channel:', error);
    res.status(500).json({ error: 'Failed to scan channel' });
  }
});

// Post tracking endpoint
app.get('/api/track-posts/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { limit = 50 } = req.query;
    
    // Try to fetch from Telethon service
    try {
      const telethonUrl = process.env.TELETHON_URL || 'http://localhost:8000';
      const response = await fetch(`${telethonUrl}/track-posts/${username}`, {
        timeout: 15000
      });
      
      if (response.ok) {
        const postData = await response.json();
        
        // Store in database
        if (db && postData.posts) {
          await db.collection('user_posts').insertMany(
            postData.posts.map(post => ({
              ...post,
              username,
              fetchedAt: new Date().toISOString()
            }))
          );
        }
        
        return res.json(postData);
      }
    } catch (telethonError) {
      console.log('Telethon service not available');
    }
    
    // Check database for cached data
    if (db) {
      const cachedPosts = await db.collection('user_posts')
        .find({ username })
        .sort({ date: -1 })
        .limit(parseInt(limit))
        .toArray();
      
      if (cachedPosts.length > 0) {
        const totalStats = await db.collection('user_posts').aggregate([
          { $match: { username } },
          { 
            $group: { 
              _id: null, 
              total_posts: { $sum: 1 },
              total_views: { $sum: '$views' },
              total_forwards: { $sum: '$forwards' }
            } 
          }
        ]).toArray();
        
        return res.json({
          posts: cachedPosts,
          total_posts: totalStats[0]?.total_posts || cachedPosts.length,
          total_views: totalStats[0]?.total_views || 0,
          total_forwards: totalStats[0]?.total_forwards || 0,
          cached: true,
          message: 'Showing cached data - Telegram service unavailable'
        });
      }
    }
    
    // No data available
    res.status(503).json({ 
      error: 'Post tracking unavailable. Telegram service is not accessible and no cached data found.' 
    });
    
  } catch (error) {
    console.error('Error tracking posts:', error);
    res.status(500).json({ error: 'Failed to track posts' });
  }
});

// Helper function to generate mock post content
function getMockPostText(username, index) {
  const templates = [
    `🚀 New opportunity alert! Just spotted a potential 10x gem. Research shows strong fundamentals and growing community support. Entry looks favorable at current levels. #crypto #trading`,
    `📈 Market analysis: Current trends show bullish momentum across multiple indicators. Volume is picking up and technical patterns are aligning. This could be the breakout we've been waiting for. 📊`,
    `⚡ Quick update: Portfolio rebalancing complete. Taking profits on some positions and accumulating quality projects during this dip. Risk management is key in this volatile market. 💎`,
    `🔥 Alpha alert: Discovered an interesting protocol with innovative tokenomics. Team is doxxed, audit complete, and partnerships are solid. Might be worth a deeper dive. DYOR as always.`,
    `📱 Technical analysis: Chart patterns are showing confluence with fibonacci retracements and key support levels. Volume profile suggests strong institutional interest. 🎯`,
    `💡 Educational thread: Understanding market cycles and how to position yourself for maximum gains while minimizing risk. Psychology plays a huge role in trading success. 🧠`,
    `🌟 Community update: Thanks for 50K followers! Your support means everything. Next week I'll be sharing exclusive insights from my research into emerging DeFi protocols. Stay tuned! 🙏`,
    `⚠️ Risk warning: Markets are extremely volatile right now. Please manage your position sizes and never invest more than you can afford to lose. Emotional trading is the enemy. 📉`
  ];
  
  return templates[index % templates.length];
}

// AI Analysis simulation function
async function performAIAnalysis(posts, username, analysisType) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const postTexts = posts.map(p => p.text || '').join(' ');
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalForwards = posts.reduce((sum, p) => sum + (p.forwards || 0), 0);
  const avgEngagement = posts.length > 0 ? (totalForwards / totalViews) * 100 : 0;
  
  // Simulate sentiment analysis
  const positiveWords = ['🚀', '📈', 'bullish', 'opportunity', 'gem', 'moon', '💎', 'profit'];
  const negativeWords = ['📉', 'bearish', 'dump', 'scam', 'rug', 'warning', '⚠️'];
  
  const positiveScore = positiveWords.reduce((score, word) => 
    score + (postTexts.toLowerCase().split(word.toLowerCase()).length - 1), 0);
  const negativeScore = negativeWords.reduce((score, word) => 
    score + (postTexts.toLowerCase().split(word.toLowerCase()).length - 1), 0);
  
  const sentimentScore = positiveScore > negativeScore ? 
    Math.min(0.8, 0.3 + (positiveScore / (positiveScore + negativeScore + 1)) * 0.7) :
    Math.max(0.2, 0.7 - (negativeScore / (positiveScore + negativeScore + 1)) * 0.7);
  
  // Generate topic analysis
  const topics = [
    { name: 'Trading', percentage: Math.floor(Math.random() * 30) + 20 },
    { name: 'DeFi', percentage: Math.floor(Math.random() * 25) + 15 },
    { name: 'Altcoins', percentage: Math.floor(Math.random() * 20) + 10 },
    { name: 'Bitcoin', percentage: Math.floor(Math.random() * 15) + 10 },
    { name: 'Market Analysis', percentage: Math.floor(Math.random() * 10) + 5 }
  ];
  
  // Normalize percentages
  const totalPercentage = topics.reduce((sum, topic) => sum + topic.percentage, 0);
  topics.forEach(topic => {
    topic.percentage = Math.round((topic.percentage / totalPercentage) * 100);
  });
  
  return {
    username,
    analysisType,
    sentiment: sentimentScore > 0.6 ? 'Positive' : sentimentScore > 0.4 ? 'Neutral' : 'Negative',
    sentimentScore: Math.round(sentimentScore * 100) / 100,
    engagement: Math.round(avgEngagement * 10) / 10,
    influence: Math.min(100, Math.round((totalViews / 1000) + (avgEngagement * 10))),
    topics: topics.slice(0, 5),
    riskLevel: avgEngagement > 5 ? 'High' : avgEngagement > 2 ? 'Medium' : 'Low',
    metrics: {
      totalPosts: posts.length,
      totalViews,
      totalForwards,
      avgViews: posts.length > 0 ? Math.round(totalViews / posts.length) : 0,
      avgForwards: posts.length > 0 ? Math.round(totalForwards / posts.length) : 0,
      engagementRate: Math.round(avgEngagement * 100) / 100
    },
    generatedAt: new Date().toISOString()
  };
}

// Auth endpoints (mock)
app.post('/api/auth/login', (req, res) => {
  res.json({ token: 'mock-token', user: { username: 'demo' } });
});

app.post('/api/auth/register', (req, res) => {
  res.json({ message: 'User registered successfully' });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ username: 'demo', email: 'demo@example.com' });
});

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: userIdCounter++,
      username,
      email,
      password: hashedPassword,
      plan: 'free',
      walletAddress: `wallet_${userIdCounter}`,
      createdAt: new Date()
    };

    users.push(newUser);
    
    // Generate token
    const token = jwt.sign(
      { userId: newUser.id, email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userData = {
      id: newUser.id,
      username,
      email,
      plan: 'free',
      walletAddress: newUser.walletAddress,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      user: userData,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      plan: user.plan || 'free',
      walletAddress: user.walletAddress,
      createdAt: user.createdAt
    };

    res.json({
      user: userData,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      plan: user.plan || 'free',
      walletAddress: user.walletAddress,
      createdAt: user.createdAt
    };

    res.json(userData);

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const updates = req.body;
    const userIndex = users.findIndex(u => u.id === req.user.userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash password if provided
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Update user
    users[userIndex] = { ...users[userIndex], ...updates };

    const userData = {
      id: users[userIndex].id,
      username: users[userIndex].username,
      email: users[userIndex].email,
      plan: users[userIndex].plan || 'free',
      walletAddress: users[userIndex].walletAddress,
      createdAt: users[userIndex].createdAt
    };

    res.json(userData);

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Game endpoints (simplified)
app.get('/api/games', verifyToken, (req, res) => {
  res.json({ games: [] });
});

app.post('/api/games', verifyToken, (req, res) => {
  res.json({ message: 'Game created', gameId: 'demo_game_' + Date.now() });
});

// Game room utilities
function createGameRoom(gameType, betAmount, currency, creator) {
  const roomId = Math.random().toString(36).substring(2, 15);
  const room = {
    id: roomId,
    gameType,
    betAmount,
    currency,
    players: [creator],
    status: 'waiting',
    createdAt: new Date().toISOString(),
    gameData: {}
  };
  gameRooms.set(roomId, room);
  return room;
}

function findAvailableRoom(gameType, betAmount, currency) {
  for (const room of gameRooms.values()) {
    if (room.gameType === gameType && 
        room.betAmount === betAmount && 
        room.currency === currency && 
        room.status === 'waiting' && 
        room.players.length < 2) {
      return room;
    }
  }
  return null;
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🎮 New client connected:', socket.id);
  
  socket.on('disconnect', (reason) => {
    console.log('🔌 Client disconnected:', socket.id, 'Reason:', reason);
    // Clean up any game rooms or user data
    for (const [roomId, room] of gameRooms.entries()) {
      if (room.players.some(p => p.socketId === socket.id)) {
        handlePlayerLeave(roomId, socket.id);
      }
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Game logic functions
function startGameCountdown(roomId) {
  const room = gameRooms.get(roomId);
  if (!room) return;

  let countdown = 3;
  
  const countdownInterval = setInterval(() => {
    io.to(roomId).emit('game_update', {
      type: 'countdown',
      data: { count: countdown },
      roomId
    });

    countdown--;
    
    if (countdown < 0) {
      clearInterval(countdownInterval);
      
      io.to(roomId).emit('game_update', {
        type: 'game_started',
        data: { room },
        roomId
      });

      // Set timeout for auto-resolve if players don't make choices
      setTimeout(() => {
        const currentRoom = gameRooms.get(roomId);
        if (currentRoom && currentRoom.status === 'playing') {
          // Auto-resolve with random choices for inactive players
          currentRoom.players.forEach(player => {
            if (!player.choice) {
              if (currentRoom.gameType === 'coinflip') {
                player.choice = Math.random() > 0.5 ? 'heads' : 'tails';
              }
            }
          });
          resolveGame(roomId);
        }
      }, 30000); // 30 second timeout
    }
  }, 1000);
}

function resolveGame(roomId) {
  const room = gameRooms.get(roomId);
  if (!room || room.status !== 'playing') return;

  console.log(`🎲 Resolving game in room ${roomId}`);
  
  let winner = null;
  let gameResult = {};

  if (room.gameType === 'coinflip') {
    const coinResult = Math.random() > 0.5 ? 'heads' : 'tails';
    const winningPlayers = room.players.filter(p => p.choice === coinResult);
    
    if (winningPlayers.length === 1) {
      winner = winningPlayers[0];
    } else if (winningPlayers.length === 0) {
      // House wins, pick random player as backup
      winner = room.players[Math.floor(Math.random() * room.players.length)];
    } else {
      // Tie, pick random winner
      winner = winningPlayers[Math.floor(Math.random() * winningPlayers.length)];
    }

    gameResult = {
      coinResult,
      choices: room.players.map(p => ({ 
        playerId: p.id, 
        username: p.username, 
        choice: p.choice 
      })),
      winner: winner ? {
        id: winner.id,
        username: winner.username,
        payout: room.betAmount * 1.8
      } : null
    };
  }

  room.status = 'finished';
  room.winner = winner;
  room.gameResult = gameResult;

  // Send results to all players
  io.to(roomId).emit('game_update', {
    type: 'game_result',
    data: gameResult,
    roomId
  });

  // Clean up room after 10 seconds
  setTimeout(() => {
    gameRooms.delete(roomId);
    console.log(`🗑️ Room ${roomId} cleaned up after game completion`);
  }, 10000);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    activeRooms: gameRooms.size,
    connectedUsers: activeConnections.size
  });
});

// Create default demo user
users.push({
  id: 'demo-user-123',
  email: 'demo@example.com',
  username: 'DemoPlayer',
  password: 'demo123',
  walletAddress: 'demo-wallet-address',
  createdAt: new Date().toISOString(),
  balance: { USDT: 1000, SOL: 10 }
});

// Mock data for when DB is not available
const mockKOLs = [
  {
    _id: "mock1",
    displayName: "Crypto Whale",
    telegramUsername: "cryptowhale",
    description: "Leading crypto analyst and trader",
    tags: ["crypto", "trading", "analysis"],
    stats: {
      totalPosts: 150,
      totalViews: 50000,
      totalForwards: 2500,
      lastUpdated: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: "mock2",
    displayName: "DeFi Expert",
    telegramUsername: "defiexpert",
    description: "Decentralized finance specialist",
    tags: ["defi", "yield", "protocols"],
    stats: {
      totalPosts: 89,
      totalViews: 35000,
      totalForwards: 1800,
      lastUpdated: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Connect to MongoDB
async function connectDB() {
  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('Connected to MongoDB');
    db = client.db();
    
    // Handle MongoDB disconnection
    client.on('close', () => {
      console.log('MongoDB connection closed. Attempting to reconnect...');
      setTimeout(connectDB, 5000);
    });
    
    client.on('error', (error) => {
    console.error('MongoDB connection error:', error);
      setTimeout(connectDB, 5000);
    });
    
    return client;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
    return null;
  }
}

// Keep-alive mechanism for Render free tier
if (process.env.KEEP_ALIVE === 'true') {
  const SELF_PING_INTERVAL = 10 * 60 * 1000; // 10 minutes
  const selfPingUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  
  setInterval(async () => {
    try {
      const response = await fetch(`${selfPingUrl}/health`);
      if (response.ok) {
        console.log(`🏓 Keep-alive ping successful at ${new Date().toISOString()}`);
      }
    } catch (error) {
      console.log(`❌ Keep-alive ping failed: ${error.message}`);
    }
  }, SELF_PING_INTERVAL);
  
  console.log('🔄 Keep-alive mechanism enabled');
}

// Start server
async function startServer() {
  try {
    await connectDB();
    
    server.listen(PORT, () => {
      console.log(`🚀 KOL Tracker API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api`);
      console.log(`🔗 Frontend: https://kol-tracker-pro.vercel.app`);
      console.log('🎮 Socket.IO enabled for real-time gaming');
      
      if (process.env.KEEP_ALIVE === 'true') {
        console.log('🔄 Keep-alive pings will start in 10 minutes');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 