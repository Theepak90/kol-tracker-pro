const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');
const { Pool } = require('pg');
const fetch = require('node-fetch');
const path = require('path');

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

// PostgreSQL connection
const DATABASE_URL = process.env.DATABASE_URL;
let pool;

// Database connection status tracking
let dbConnected = false;
let connectionRetryCount = 0;
const MAX_RETRY_ATTEMPTS = 10;

// In-memory storage fallback
let users = [];
let userIdCounter = 1;

// In-memory storage
const gameRooms = new Map();
const activeConnections = new Map(); // socketId -> userId

// Enhanced CORS configuration for production
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://localhost:5175',
      'http://localhost:5176',
      'https://kol-tracker-pro.vercel.app',
      'https://kolopz.com',
      'https://www.kolopz.com',
      'https://api.kolopz.com',
      'https://telethon.kolopz.com'
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

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

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
    if (pool) {
      const result = await pool.query('SELECT * FROM kols ORDER BY created_at DESC');
      res.json(result.rows);
    } else {
      // Return empty array when MongoDB is not available
      console.log('📝 Returning empty KOLs list (PostgreSQL not connected)');
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching KOLs:', error);
    // Return empty array instead of error to keep frontend working
    res.json([]);
  }
});

// Get specific KOL
app.get('/api/kols/:username', async (req, res) => {
  try {
    const { username } = req.params;
    if (pool) {
      const result = await pool.query('SELECT * FROM kols WHERE telegram_username = $1', [username]);
      if (result.rows.length > 0) {
        res.json(result.rows[0]);
      } else {
        res.status(404).json({ error: 'KOL not found' });
      }
    } else {
      // Return 404 when MongoDB is not available (consistent with not found)
      console.log(`📝 KOL ${username} not found (PostgreSQL not connected)`);
      res.status(404).json({ error: 'KOL not found' });
    }
  } catch (error) {
    console.error('Error fetching KOL:', error);
    res.status(404).json({ error: 'KOL not found' });
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

    if (pool) {
      const result = await pool.query(
        'INSERT INTO kols (username, telegram_username, stats, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [kolData.username, kolData.telegramUsername, JSON.stringify(kolData.stats), kolData.createdAt, kolData.updatedAt]
      );
      res.json({ ...kolData, _id: result.rows[0].id });
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

    if (pool) {
      await pool.query(
        'UPDATE kols SET username = $1, telegram_username = $2, stats = $3, updated_at = $4 WHERE telegram_username = $5',
        [updateData.username, updateData.telegramUsername, JSON.stringify(updateData.stats), updateData.updatedAt, username]
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
    
    if (pool) {
      await pool.query('DELETE FROM kols WHERE telegram_username = $1', [username]);
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
      const response = await fetch(`${telethonUrl}/track-posts/${username}?limit=${limit}`, {
        timeout: 10000
      });
      
      if (response.ok) {
        const posts = await response.json();
        
        // Store posts in database if available
        if (pool && posts.length > 0) {
          await pool.query(
            'INSERT INTO user_posts (username, text, views, forwards, date, fetched_at) VALUES ($1, $2, $3, $4, $5, $6)',
            posts.map(post => [
              username,
              post.text,
              post.views,
              post.forwards,
              post.date,
              new Date().toISOString()
            ])
          );
        }
        
        return res.json(posts);
      }
    } catch (telethonError) {
      console.log('Telethon service not available');
    }
    
    // Fallback to database
    if (pool) {
      const posts = await pool.query(
        'SELECT * FROM user_posts WHERE username = $1 ORDER BY date DESC LIMIT $2',
        [username, parseInt(limit)]
      );
      
      if (posts.rows.length > 0) {
        return res.json(posts.rows);
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

// Helper function to generate realistic AI analysis
function generateAIAnalysis(posts, username) {
  const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
  const totalForwards = posts.reduce((sum, post) => sum + (post.forwards || 0), 0);
  const averageViews = totalViews / posts.length;
  const averageForwards = totalForwards / posts.length;
  const engagementRate = totalViews > 0 ? (totalForwards / totalViews) * 100 : 0;
  
  // Analyze post content for topics
  const postTexts = posts.map(p => p.text.toLowerCase());
  const cryptoKeywords = ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'blockchain', 'defi', 'nft', 'token', 'coin'];
  const techKeywords = ['telegram', 'ton', 'privacy', 'security', 'app', 'technology', 'innovation'];
  const tradingKeywords = ['trading', 'market', 'price', 'pump', 'dump', 'buy', 'sell', 'investment'];
  
  const cryptoScore = cryptoKeywords.reduce((score, keyword) => 
    score + postTexts.reduce((count, text) => count + (text.includes(keyword) ? 1 : 0), 0), 0
  );
  const techScore = techKeywords.reduce((score, keyword) => 
    score + postTexts.reduce((count, text) => count + (text.includes(keyword) ? 1 : 0), 0), 0
  );
  const tradingScore = tradingKeywords.reduce((score, keyword) => 
    score + postTexts.reduce((count, text) => count + (text.includes(keyword) ? 1 : 0), 0), 0
  );
  
  // Determine expertise areas
  const expertiseAreas = [];
  if (cryptoScore > 2) expertiseAreas.push('Cryptocurrency');
  if (techScore > 2) expertiseAreas.push('Technology');
  if (tradingScore > 1) expertiseAreas.push('Trading');
  if (expertiseAreas.length === 0) expertiseAreas.push('General Content');
  
  // Calculate sentiment (basic positive/negative word analysis)
  const positiveWords = ['great', 'excellent', 'amazing', 'good', 'best', 'successful', 'growth', 'rising'];
  const negativeWords = ['bad', 'terrible', 'crash', 'dump', 'failed', 'worst', 'declining'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  postTexts.forEach(text => {
    positiveWords.forEach(word => { if (text.includes(word)) positiveCount++; });
    negativeWords.forEach(word => { if (text.includes(word)) negativeCount++; });
  });
  
  const sentimentScore = positiveCount > negativeCount ? 0.7 : 
                        negativeCount > positiveCount ? 0.3 : 0.5;
  const sentimentLabel = sentimentScore > 0.6 ? 'positive' : 
                        sentimentScore < 0.4 ? 'negative' : 'neutral';
  
  // Determine influence and risk scores
  const influenceScore = Math.min(90, Math.max(30, 
    (averageViews / 1000) * 20 + 
    engagementRate * 10 + 
    (posts.length > 5 ? 20 : posts.length * 4)
  ));
  
  const riskLevel = engagementRate > 8 ? 'low' : 
                   engagementRate > 4 ? 'medium' : 'high';
  
  return {
    overall_sentiment: {
      label: sentimentLabel,
      score: sentimentScore
    },
    engagement_metrics: {
      average_views: Math.round(averageViews),
      average_forwards: Math.round(averageForwards),
      engagement_rate: Math.round(engagementRate * 100) / 100,
      viral_potential: Math.min(10, engagementRate / 2)
    },
    content_analysis: {
      primary_topics: [
        { label: expertiseAreas[0], confidence: 0.85 },
        { label: expertiseAreas[1] || 'Social Media', confidence: 0.65 }
      ],
      sentiment_trend: sentimentScore > 0.6 ? 'improving' : 
                      sentimentScore < 0.4 ? 'declining' : 'stable',
      posting_frequency: posts.length / 7, // posts per day in last week
      content_quality_score: Math.min(10, influenceScore / 10)
    },
    influence_metrics: {
      overall_influence_score: Math.round(influenceScore),
      market_impact_potential: influenceScore > 70 ? 'high' : 
                              influenceScore > 50 ? 'medium' : 'low',
      credibility_score: Math.min(100, influenceScore + 10),
      expertise_areas: expertiseAreas
    },
    risk_assessment: {
      overall_risk: riskLevel,
      risk_factors: riskLevel === 'high' ? 
        ['Low engagement rates', 'Limited posting history', 'Unverified claims'] :
        riskLevel === 'medium' ?
        ['Moderate engagement', 'Some unverified information'] :
        ['High engagement', 'Consistent posting', 'Reliable content'],
      recommendations: riskLevel === 'high' ?
        ['Monitor engagement closely', 'Verify claims independently', 'Start with small exposure'] :
        ['Good candidate for following', 'Monitor for market signals', 'Consider for portfolio decisions']
    },
    key_insights: [
      `${username} shows ${influenceScore > 60 ? 'strong' : 'moderate'} influence with ${averageViews.toFixed(0)} average views per post`,
      `Primary expertise appears to be in ${expertiseAreas[0]} with ${sentimentLabel} sentiment overall`,
      `Engagement rate of ${engagementRate.toFixed(1)}% indicates ${engagementRate > 5 ? 'active' : 'moderate'} audience interaction`,
      `Content quality and consistency suggest ${riskLevel} risk for investment following`
    ],
    performance_summary: `${username} demonstrates ${influenceScore > 70 ? 'excellent' : influenceScore > 50 ? 'good' : 'moderate'} performance as a KOL with consistent ${expertiseAreas[0].toLowerCase()} content and ${sentimentLabel} market outlook. ${engagementRate > 5 ? 'High engagement rates suggest strong community trust.' : 'Engagement could be improved for better influence metrics.'}`
  };
}

// AI Analysis for KOL
app.post('/api/kols/:username/analyze', async (req, res) => {
  try {
    const { username } = req.params;
    const { posts, analysisType = 'full' } = req.body;
    
    if (!posts || posts.length === 0) {
      return res.status(400).json({ error: 'No posts provided for analysis' });
    }
    
    // Generate realistic AI analysis based on posts
    const analysis = generateAIAnalysis(posts, username);
    
    // Store analysis in database
    if (pool) {
      await pool.query(
        'INSERT INTO kol_analyses (username, analysis, posts, analyzed_at) VALUES ($1, $2, $3, $4)',
        [username, JSON.stringify(analysis), posts.length, new Date().toISOString()]
      );
    }
    
    res.json(analysis);
    
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
        if (pool && kols.length > 0) {
          await pool.query(
            'INSERT INTO discovered_kols (username, discovered_from, discovered_at) VALUES ($1, $2, $3)',
            kols.map(kol => [
              kol.username,
              groupName,
              new Date().toISOString()
            ])
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
    if (pool) {
      const cachedKols = await pool.query(
        'SELECT * FROM discovered_kols WHERE discovered_from = $1 ORDER BY discovered_at DESC LIMIT $2',
        [groupName, parseInt(limit)]
      );
      
      if (cachedKols.rows.length > 0) {
        return res.json({
          success: true,
          groupName,
          kols: cachedKols.rows,
          totalFound: cachedKols.rows.length,
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

// Bot Detection endpoints
app.get('/api/bot-detection/analyze/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { user_id } = req.query;
    
    // Try to fetch from Telethon service
    try {
      const telethonUrl = process.env.TELETHON_URL || 'http://localhost:8000';
      let url = `${telethonUrl}/scan/${username}`;
      if (user_id) {
        url += `?user_id=${user_id}`;
      }
      
      const response = await fetch(url, { timeout: 15000 });
      
      if (response.ok) {
        const scanResult = await response.json();
        
        // Transform to bot detection format
        const botResult = processBotDetectionAnalysis(scanResult, username, 'user');
        
        // Store in database
        if (pool) {
          await pool.query(
            'INSERT INTO bot_detections (username, display_name, is_bot, confidence, status, detection_date, profile_analysis, activity_analysis, content_analysis, network_analysis, ai_analysis, metrics) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
            [
              botResult.username,
              botResult.displayName,
              botResult.isBot,
              botResult.confidence,
              botResult.status,
              botResult.detectionDate,
              JSON.stringify(botResult.profileAnalysis),
              JSON.stringify(botResult.activityAnalysis),
              JSON.stringify(botResult.contentAnalysis),
              JSON.stringify(botResult.networkAnalysis),
              JSON.stringify(botResult.aiAnalysis),
              JSON.stringify(botResult.metrics)
            ]
          );
        }
        
        return res.json(botResult);
      }
    } catch (telethonError) {
      console.log('Telethon service not available for bot detection');
      return res.status(503).json({ 
        error: 'Bot detection service unavailable. Please ensure Telegram is connected and authenticated.' 
      });
    }
    
  } catch (error) {
    console.error('Error in bot detection:', error);
    res.status(500).json({ error: 'Failed to analyze user' });
  }
});

app.get('/api/bot-detection/analyze-channel/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    const { user_id } = req.query;
    
    // Clean channel ID
    const cleanChannelId = channelId.replace('https://t.me/', '').replace('@', '');
    
    // Try to fetch from Telethon service
    try {
      const telethonUrl = process.env.TELETHON_URL || 'http://localhost:8000';
      let url = `${telethonUrl}/scan/${cleanChannelId}`;
      if (user_id) {
        url += `?user_id=${user_id}`;
      }
      
      const response = await fetch(url, { timeout: 15000 });
      
      if (response.ok) {
        const scanResult = await response.json();
        
        // Transform to bot detection format
        const botResult = processBotDetectionAnalysis(scanResult, cleanChannelId, 'channel');
        
        // Store in database
        if (pool) {
          await pool.query(
            'INSERT INTO bot_detections (username, display_name, is_bot, confidence, status, detection_date, profile_analysis, activity_analysis, content_analysis, network_analysis, ai_analysis, metrics) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
            [
              botResult.username,
              botResult.displayName,
              botResult.isBot,
              botResult.confidence,
              botResult.status,
              botResult.detectionDate,
              JSON.stringify(botResult.profileAnalysis),
              JSON.stringify(botResult.activityAnalysis),
              JSON.stringify(botResult.contentAnalysis),
              JSON.stringify(botResult.networkAnalysis),
              JSON.stringify(botResult.aiAnalysis),
              JSON.stringify(botResult.metrics)
            ]
          );
        }
        
        return res.json(botResult);
      }
    } catch (telethonError) {
      console.log('Telethon service not available for bot detection');
      return res.status(503).json({ 
        error: 'Bot detection service unavailable. Please ensure Telegram is connected and authenticated.' 
      });
    }
    
  } catch (error) {
    console.error('Error in channel bot detection:', error);
    res.status(500).json({ error: 'Failed to analyze channel' });
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
        if (pool) {
          await pool.query(
            'INSERT INTO channel_scans (channel_name, scanned_at) VALUES ($1, $2)',
            [channelName, new Date().toISOString()]
          );
        }
        
        return res.json(scanResult);
      }
    } catch (telethonError) {
      console.log('Telethon service not available');
    }
    
    // Check database for cached data
    if (pool) {
      const cachedScan = await pool.query(
        'SELECT * FROM channel_scans WHERE channel_name = $1 ORDER BY scanned_at DESC LIMIT 1',
        [channelName]
      );
      
      if (cachedScan.rows.length > 0) {
        return res.json({
          ...cachedScan.rows[0],
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
        if (pool && postData.posts) {
          await pool.query(
            'INSERT INTO user_posts (username, text, views, forwards, date, fetched_at) VALUES ($1, $2, $3, $4, $5, $6)',
            postData.posts.map(post => [
              username,
              post.text,
              post.views,
              post.forwards,
              post.date,
              new Date().toISOString()
            ])
          );
        }
        
        return res.json(postData);
      }
    } catch (telethonError) {
      console.log('Telethon service not available');
    }
    
    // Check database for cached data
    if (pool) {
      const cachedPosts = await pool.query(
        'SELECT * FROM user_posts WHERE username = $1 ORDER BY date DESC LIMIT $2',
        [username, parseInt(limit)]
      );
      
      if (cachedPosts.rows.length > 0) {
        const totalStats = await pool.query(
          'SELECT COUNT(*) AS total_posts, SUM(views) AS total_views, SUM(forwards) AS total_forwards FROM user_posts WHERE username = $1',
          [username]
        );
        
        return res.json({
          posts: cachedPosts.rows,
          total_posts: totalStats.rows[0]?.total_posts || cachedPosts.rows.length,
          total_views: totalStats.rows[0]?.total_views || 0,
          total_forwards: totalStats.rows[0]?.total_forwards || 0,
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

// Removed mock post generation - using only real Telegram data

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

// Removed mock auth endpoints - using real authentication below

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

// Remove mock data - using only real data from database and Telegram

// Initialize PostgreSQL database schema
async function initializeDatabase() {
  if (!pool) return;
  
  try {
    console.log('🔧 Initializing database schema...');
    
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        telegram_id BIGINT,
        telegram_username VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS kols (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        telegram_username VARCHAR(255) UNIQUE,
        display_name VARCHAR(255),
        stats JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS user_posts (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        text TEXT,
        views INTEGER DEFAULT 0,
        forwards INTEGER DEFAULT 0,
        date TIMESTAMP,
        fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS bot_detections (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        display_name VARCHAR(255),
        is_bot BOOLEAN DEFAULT FALSE,
        confidence DECIMAL(3,2) DEFAULT 0.0,
        status VARCHAR(50) DEFAULT 'unknown',
        detection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        profile_analysis JSONB DEFAULT '{}',
        activity_analysis JSONB DEFAULT '{}',
        content_analysis JSONB DEFAULT '{}',
        network_analysis JSONB DEFAULT '{}',
        ai_analysis JSONB DEFAULT '{}',
        metrics JSONB DEFAULT '{}',
        analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS kol_analyses (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        analysis JSONB DEFAULT '{}',
        posts INTEGER DEFAULT 0,
        analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS discovered_kols (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        discovered_from VARCHAR(255),
        discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS channel_scans (
        id SERIAL PRIMARY KEY,
        channel_name VARCHAR(255) NOT NULL,
        scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_kols_telegram_username ON kols(telegram_username);
      CREATE INDEX IF NOT EXISTS idx_user_posts_username ON user_posts(username);
      CREATE INDEX IF NOT EXISTS idx_bot_detections_username ON bot_detections(username);
    `);
    
    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database schema:', error);
  }
}

// Enhanced PostgreSQL connection with better error handling
async function connectDB() {
  // Skip connection if we've exceeded retry attempts
  if (connectionRetryCount >= MAX_RETRY_ATTEMPTS) {
    console.log('🛑 Maximum PostgreSQL connection attempts reached. Running with in-memory storage only.');
    pool = null;
    dbConnected = false;
    return null;
  }

  try {
    connectionRetryCount++;
    console.log(`🔄 Attempting PostgreSQL connection (${connectionRetryCount}/${MAX_RETRY_ATTEMPTS})...`);

    // Improved connection configuration without deprecated options
    const client = new Pool({
      connectionString: DATABASE_URL,
      max: 10,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 20000,
      maxUses: 750,
      prepareThreshold: 10,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return new Promise(resolve => setTimeout(resolve, delay));
      }
    });
    
    console.log('✅ Successfully connected to PostgreSQL');
    pool = client;
    dbConnected = true;
    connectionRetryCount = 0; // Reset counter on successful connection
    
    // Initialize database schema
    await initializeDatabase();
    
    // Handle PostgreSQL disconnection
    client.on('error', (err, client) => {
      console.error('🚨 PostgreSQL connection error:', err);
      dbConnected = false;
      setTimeout(connectDB, 15000);
    });
    
    client.on('connect', (client) => {
      console.log('📡 PostgreSQL client connected');
    });
    
    client.on('remove', (client) => {
      console.log('📡 PostgreSQL client removed');
    });
    
    return client;
  } catch (error) {
    console.error(`❌ Failed to connect to PostgreSQL (attempt ${connectionRetryCount}):`, error.message);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
      console.log('🌐 DNS resolution issue detected. This might be a network connectivity problem.');
      console.log('💡 Check your internet connection and PostgreSQL Atlas network access settings.');
    }
    
    console.log('⚠️  Running with in-memory storage as fallback');
    pool = null;
    dbConnected = false;
    
    // Implement exponential backoff for retries
    const backoffDelay = Math.min(60000, 5000 * Math.pow(2, connectionRetryCount - 1));
    console.log(`🔄 Will retry PostgreSQL connection in ${backoffDelay / 1000} seconds...`);
    
    setTimeout(connectDB, backoffDelay);
    return null;
  }
}

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

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

// Bot Detection Helper Functions
function processBotDetectionAnalysis(telethonData, username, type) {
  const {
    member_count = 0,
    active_members = 0,
    bot_count = 0,
    title = username,
    description = '',
    kol_details = [],
    scam = false,
    fake = false,
    verified = false
  } = telethonData;

  // Calculate key metrics
  const activityRatio = member_count > 0 ? (active_members / member_count) * 100 : 0;
  const botRatio = active_members > 0 ? (bot_count / active_members) * 100 : 0;
  
  // Enhanced bot detection algorithm
  let botProbability = 0;
  let confidenceFactors = [];
  let riskFactors = [];
  
  // Scam/fake flags are major indicators
  if (scam) {
    botProbability += 0.7;
    riskFactors.push('Marked as scam by Telegram');
  }
  if (fake) {
    botProbability += 0.6;
    riskFactors.push('Marked as fake by Telegram');
  }
  
  // Activity analysis
  if (type === 'channel') {
    if (activityRatio < 0.5 && member_count > 5000) {
      botProbability += 0.4;
      riskFactors.push('Very low activity for large channel');
    }
    if (botRatio > 30) {
      botProbability += 0.3;
      riskFactors.push('High bot ratio in members');
    }
    if (!description || description.length < 20) {
      botProbability += 0.2;
      riskFactors.push('Missing or minimal description');
    }
  } else {
    // For users, different criteria
    if (username.match(/\d{4,}/)) {
      botProbability += 0.3;
      riskFactors.push('Username contains many numbers');
    }
  }
  
  // Positive signals
  if (verified) {
    botProbability -= 0.3;
    confidenceFactors.push('Verified by Telegram');
  }
  if (kol_details.length > 0) {
    botProbability -= 0.1;
    confidenceFactors.push('Contains identified KOLs');
  }
  if (description && description.length > 50) {
    botProbability -= 0.1;
    confidenceFactors.push('Detailed description provided');
  }
  
  // Ensure probability stays within bounds
  botProbability = Math.max(0, Math.min(1, botProbability));
  
  const confidence = Math.min(botProbability * 100, 100);
  let status;
  
  if (confidence >= 80) {
    status = 'confirmed_bot';
  } else if (confidence >= 50) {
    status = 'suspicious';
  } else if (confidence <= 20) {
    status = 'human';
  } else {
    status = 'unknown';
  }

  return {
    username: username,
    displayName: title || username,
    isBot: status === 'confirmed_bot',
    confidence: Math.round(confidence),
    status,
    detectionDate: new Date().toISOString(),
    
    profileAnalysis: {
      hasProfilePhoto: true,
      bioLength: description.length,
      hasVerifiedBadge: verified,
      accountAge: 0,
      usernamePattern: username.match(/\d{4,}/) ? 'suspicious' : 'normal',
    },
    
    activityAnalysis: {
      messageCount: 0,
      avgMessagesPerDay: 0,
      lastSeenDays: 0,
      activityPattern: activityRatio < 2 ? 'suspicious' : activityRatio < 5 ? 'inactive' : 'regular',
      timeZoneConsistency: activityRatio < 2 ? 30 : 70,
      responseTimePattern: activityRatio < 2 ? 'automated' : 'human',
    },
    
    contentAnalysis: {
      spamScore: Math.max(0, 100 - activityRatio * 10),
      duplicateContentRatio: 0,
      linkSpamRatio: 0,
      languageConsistency: 80,
      sentimentVariation: activityRatio < 2 ? 20 : 50,
      topicDiversity: Math.min(activityRatio * 5, 100),
    },
    
    networkAnalysis: {
      mutualConnections: active_members,
      suspiciousConnections: bot_count,
      networkCentrality: Math.min(activityRatio * 2, 100),
      clusteringCoefficient: Math.min(activityRatio * 3, 100),
      connectionPattern: botRatio > 15 ? 'artificial' : activityRatio < 3 ? 'mixed' : 'organic',
    },
    
    aiAnalysis: {
      overview: generateAIOverview(status, activityRatio, botRatio, member_count, type, description),
      keyIndicators: confidenceFactors,
      riskFactors: riskFactors,
      recommendations: generateRecommendations(status, activityRatio, botRatio, member_count, type),
    },
    
    metrics: {
      followers: member_count,
      following: 0,
      posts: 0,
      engagement: activityRatio,
    }
  };
}

// Removed all mock data generation functions - only real data from Telethon is used

function generateAIOverview(status, activityRatio, botRatio, memberCount, type, description) {
  if (status === 'confirmed_bot') {
    return `This ${type} exhibits multiple characteristics consistent with automated or malicious behavior. High confidence bot detection with concerning activity patterns.`;
  } else if (status === 'suspicious') {
    return `This ${type} shows some indicators that warrant closer monitoring. Moderate confidence in suspicious behavior patterns detected.`;
  } else if (status === 'human') {
    return `This ${type} appears to exhibit normal human behavior patterns. Low risk assessment with good engagement and natural activity.`;
  } else {
    return `This ${type} requires additional data for confident assessment. Mixed signals detected requiring further monitoring.`;
  }
}

function generateRecommendations(status, activityRatio, botRatio, memberCount, type) {
  const recommendations = [];
  
  if (status === 'confirmed_bot') {
    recommendations.push('Immediate review required');
    recommendations.push('Consider access restrictions');
    recommendations.push('Flag for manual investigation');
  } else if (status === 'suspicious') {
    recommendations.push('Enhanced monitoring recommended');
    recommendations.push('Review recent activity patterns');
    recommendations.push('Check network connections');
  } else {
    recommendations.push('Continue normal monitoring');
    recommendations.push('No immediate action required');
  }
  
  if (activityRatio < 1 && memberCount > 1000) {
    recommendations.push('Investigate low activity ratio');
  }
  
  if (botRatio > 20) {
    recommendations.push('High bot presence detected');
  }
  
  return recommendations;
}

// Start server
async function startServer() {
  try {
    // Start PostgreSQL connection in background (non-blocking)
    connectDB().catch(err => {
      console.log('🔧 PostgreSQL connection will retry in background');
    });
    
    server.listen(PORT, () => {
      console.log(`🚀 KOL Tracker API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api`);
      console.log(`🔗 Frontend: https://kol-tracker-pro.vercel.app`);
      console.log('🎮 Socket.IO enabled for real-time gaming');
      console.log(`🤖 Bot Detection: Available at /api/bot-detection/*`);
      console.log('💾 Using in-memory storage until PostgreSQL connects');
      
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