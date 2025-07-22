#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting KOL Tracker Backend on Render...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT || 10000);
console.log('Working directory:', process.cwd());

// Set up environment variables for production
const env = {
  ...process.env,
  NODE_ENV: 'production',
  PORT: process.env.PORT || 10000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  TELETHON_URL: process.env.TELETHON_URL || 'http://localhost:8000'
};

// Log important configuration (without sensitive data)
console.log('Configuration:');
console.log('- Database URL:', env.DATABASE_URL ? 'Set ✅' : 'Missing ❌');
console.log('- JWT Secret:', env.JWT_SECRET ? 'Set ✅' : 'Missing ❌');
console.log('- Telethon URL:', env.TELETHON_URL);

// Check if simple-server.js exists
const serverPath = path.join(__dirname, 'simple-server.js');
if (!fs.existsSync(serverPath)) {
  console.error('❌ simple-server.js not found at:', serverPath);
  process.exit(1);
}

console.log('✅ Starting simple-server.js...');

// Start the server
const child = spawn('node', ['simple-server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: env
});

child.on('error', (error) => {
  console.error('❌ Error starting backend:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`🔄 Backend exited with code ${code}`);
  process.exit(code);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📋 Received SIGTERM, shutting down gracefully...');
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('📋 Received SIGINT, shutting down gracefully...');
  child.kill('SIGINT');
});

console.log('🎯 Backend startup script initialized'); 