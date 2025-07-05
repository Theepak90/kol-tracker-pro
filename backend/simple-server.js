const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');
const { MongoClient } = require('mongodb');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://localhost:5175',
      'http://localhost:5176',
      'https://kolnexus2.netlify.app',
      'https://kolnexus-backend.onrender.com',
      'https://kolnexus-telethon.onrender.com',
      'https://6868fe2172ebe43ae9607379--kolnexus2.netlify.app'
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
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
      'https://kolnexus2.netlify.app',
      'https://kolnexus-backend.onrender.com',
      'https://kolnexus-telethon.onrender.com',
      'https://6868fe2172ebe43ae9607379--kolnexus2.netlify.app'
    ];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'KOL Tracker API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Get all KOLs
app.get('/api/kols', async (req, res) => {
  try {
    if (db) {
      const kols = await db.collection('kols').find({}).toArray();
      res.json(kols.length > 0 ? kols : mockKOLs);
    } else {
      res.json(mockKOLs);
    }
  } catch (error) {
    console.error('Error fetching KOLs:', error);
    res.json(mockKOLs);
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
        res.json(mockKOLs.find(k => k.telegramUsername === username) || mockKOLs[0]);
      }
    } else {
      res.json(mockKOLs.find(k => k.telegramUsername === username) || mockKOLs[0]);
    }
  } catch (error) {
    console.error('Error fetching KOL:', error);
    res.json(mockKOLs[0]);
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
  console.log(`🟢 User connected: ${socket.id}`);

  // Handle user authentication
  socket.on('authenticate', (data) => {
    const { token } = data;
    // Mock authentication - in real app, verify JWT token
    const user = users.find(u => u.email === 'demo@example.com'); // For demo purposes
    if (user) {
      activeConnections.set(socket.id, user.id);
      socket.userId = user.id;
      socket.emit('authenticated', { success: true, user });
    } else {
      socket.emit('authenticated', { success: false, error: 'Invalid token' });
    }
  });

  // Create game room
  socket.on('create_room', (data, callback) => {
    try {
      const { gameType, betAmount, currency } = data;
      const userId = activeConnections.get(socket.id);
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        callback({ success: false, error: 'User not authenticated' });
        return;
      }

      const player = {
        id: user.id,
        username: user.username || user.email.split('@')[0],
        walletAddress: user.walletAddress || 'demo-wallet',
        socketId: socket.id
      };

      const room = createGameRoom(gameType, betAmount, currency, player);
      socket.join(room.id);
      
      console.log(`🎮 Room created: ${room.id} by ${player.username}`);
      callback({ success: true, room });
      
      // Broadcast room creation to lobby
      socket.broadcast.emit('room_created', room);
    } catch (error) {
      console.error('Error creating room:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Join game room
  socket.on('join_room', (data, callback) => {
    try {
      const { roomId } = data;
      const room = gameRooms.get(roomId);
      
      if (!room) {
        callback({ success: false, error: 'Room not found' });
        return;
      }

      if (room.players.length >= 2) {
        callback({ success: false, error: 'Room is full' });
        return;
      }

      if (room.status !== 'waiting') {
        callback({ success: false, error: 'Game already in progress' });
        return;
      }

      const userId = activeConnections.get(socket.id);
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        callback({ success: false, error: 'User not authenticated' });
        return;
      }

      const player = {
        id: user.id,
        username: user.username || user.email.split('@')[0],
        walletAddress: user.walletAddress || 'demo-wallet',
        socketId: socket.id
      };

      room.players.push(player);
      socket.join(roomId);
      
      console.log(`🎮 ${player.username} joined room: ${roomId}`);
      callback({ success: true, room });

      // Notify all players in room
      io.to(roomId).emit('game_update', {
        type: 'player_joined',
        data: { player, room },
        roomId
      });

      // Start game if room is full
      if (room.players.length === 2) {
        room.status = 'playing';
        startGameCountdown(roomId);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Quick match
  socket.on('quick_match', (data, callback) => {
    try {
      const { gameType, betAmount, currency } = data;
      const userId = activeConnections.get(socket.id);
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        callback({ success: false, error: 'User not authenticated' });
        return;
      }

      const player = {
        id: user.id,
        username: user.username || user.email.split('@')[0],
        walletAddress: user.walletAddress || 'demo-wallet',
        socketId: socket.id
      };

      // Try to find existing room
      let room = findAvailableRoom(gameType, betAmount, currency);
      
      if (room) {
        // Join existing room
        room.players.push(player);
        socket.join(room.id);
        
        console.log(`🎮 ${player.username} quick-matched to room: ${room.id}`);
        callback({ success: true, room });

        // Notify all players
        io.to(room.id).emit('game_update', {
          type: 'player_joined',
          data: { player, room },
          roomId: room.id
        });

        // Start game
        room.status = 'playing';
        startGameCountdown(room.id);
      } else {
        // Create new room
        room = createGameRoom(gameType, betAmount, currency, player);
        socket.join(room.id);
        
        console.log(`🎮 ${player.username} created quick-match room: ${room.id}`);
        callback({ success: true, room });
      }
    } catch (error) {
      console.error('Error in quick match:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Get available rooms
  socket.on('get_rooms', (data, callback) => {
    try {
      const { gameType } = data;
      const rooms = Array.from(gameRooms.values())
        .filter(room => {
          if (gameType && room.gameType !== gameType) return false;
          return room.status === 'waiting' && room.players.length < 2;
        })
        .map(room => ({
          ...room,
          players: room.players.map(p => ({ ...p, socketId: undefined }))
        }));
      
      callback({ success: true, rooms });
    } catch (error) {
      console.error('Error getting rooms:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Game choice
  socket.on('game_choice', (data) => {
    try {
      const { roomId, choice } = data;
      const room = gameRooms.get(roomId);
      const userId = activeConnections.get(socket.id);
      
      if (!room || !userId) return;

      const player = room.players.find(p => p.id === userId);
      if (!player) return;

      player.choice = choice;
      console.log(`🎯 ${player.username} made choice in room ${roomId}:`, choice);

      // Notify other players (without revealing choice)
      socket.to(roomId).emit('game_update', {
        type: 'player_choice',
        data: { playerId: player.id, hasChoice: true },
        roomId
      });

      // Check if both players have made choices
      const allPlayersReady = room.players.every(p => p.choice !== undefined);
      if (allPlayersReady && room.players.length === 2) {
        resolveGame(roomId);
      }
    } catch (error) {
      console.error('Error handling game choice:', error);
    }
  });

  // Player ready
  socket.on('player_ready', (data) => {
    try {
      const { roomId, ready } = data;
      const room = gameRooms.get(roomId);
      const userId = activeConnections.get(socket.id);
      
      if (!room || !userId) return;

      const player = room.players.find(p => p.id === userId);
      if (!player) return;

      player.isReady = ready;

      io.to(roomId).emit('game_update', {
        type: 'player_ready',
        data: { playerId: player.id, ready },
        roomId
      });
    } catch (error) {
      console.error('Error handling player ready:', error);
    }
  });

  // Chat message
  socket.on('chat_message', (data) => {
    try {
      const { roomId, message } = data;
      const userId = activeConnections.get(socket.id);
      const user = users.find(u => u.id === userId);
      
      if (!user) return;

      const chatMessage = {
        id: Date.now().toString(),
        userId: user.id,
        username: user.username || user.email.split('@')[0],
        message,
        timestamp: new Date().toISOString()
      };

      io.to(roomId).emit('chat_message', chatMessage);
    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  });

  // Emote
  socket.on('emote', (data) => {
    try {
      const { roomId, emote } = data;
      const userId = activeConnections.get(socket.id);
      const user = users.find(u => u.id === userId);
      
      if (!user) return;

      socket.to(roomId).emit('emote', {
        userId: user.id,
        username: user.username || user.email.split('@')[0],
        emote,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error handling emote:', error);
    }
  });

  // Leave room
  socket.on('leave_room', (data) => {
    try {
      const { roomId } = data;
      const room = gameRooms.get(roomId);
      const userId = activeConnections.get(socket.id);
      
      if (!room || !userId) return;

      room.players = room.players.filter(p => p.id !== userId);
      socket.leave(roomId);

      if (room.players.length === 0) {
        gameRooms.delete(roomId);
        console.log(`🗑️ Room ${roomId} deleted - no players`);
      } else {
        io.to(roomId).emit('game_update', {
          type: 'player_left',
          data: { userId },
          roomId
        });
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
    const userId = activeConnections.get(socket.id);
    activeConnections.delete(socket.id);

    // Clean up rooms
    for (const [roomId, room] of gameRooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        
        if (room.players.length === 0) {
          gameRooms.delete(roomId);
        } else {
          io.to(roomId).emit('game_update', {
            type: 'player_left',
            data: { userId },
            roomId
          });
        }
      }
    }
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

// Authentication Routes
app.post('/api/register', (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    if (users.some(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const user = {
      id: Math.random().toString(36).substring(2, 15),
      email,
      username: username || email.split('@')[0],
      password, // In production, hash this!
      walletAddress: `demo-wallet-${Math.random().toString(36).substring(2, 10)}`,
      createdAt: new Date().toISOString(),
      balance: { USDT: 1000, SOL: 10 } // Demo balance
    };
    
    users.push(user);
    
    // Generate simple JWT-like token (demo purposes)
    const token = Buffer.from(JSON.stringify({ userId: user.id, email })).toString('base64');
    
    res.json({
      message: 'User registered successfully',
      token,
      user: { ...user, password: undefined }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate simple JWT-like token (demo purposes)
    const token = Buffer.from(JSON.stringify({ userId: user.id, email })).toString('base64');
    
    res.json({
      message: 'Login successful',
      token,
      user: { ...user, password: undefined }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = users.find(u => u.email === decoded.email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.json({ user: { ...user, password: undefined } });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.get('/api/profile', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = users.find(u => u.email === decoded.email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.json({
      profile: {
        ...user,
        password: undefined,
        gamesPlayed: Math.floor(Math.random() * 50),
        totalWinnings: Math.floor(Math.random() * 5000),
        rank: Math.floor(Math.random() * 1000) + 1
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

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
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('kol_tracker');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// Start server
async function startServer() {
  await connectDB();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KOL Tracker API running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api`);
    console.log(`🔗 Frontend: https://kolnexus2.netlify.app`);
  });
}

startServer().catch(console.error); 