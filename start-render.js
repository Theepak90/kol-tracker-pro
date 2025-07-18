#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting KOL Tracker Pro on Render...');
console.log('Current directory:', process.cwd());
console.log('Looking for backend files...');

// Check if we're in the right directory structure
const backendPath = path.join(process.cwd(), 'backend');
const mainPath = path.join(backendPath, 'dist', 'main.js');

console.log('Backend path:', backendPath);
console.log('Main file path:', mainPath);

// Try to start the application
try {
  const child = spawn('node', ['dist/main.js'], {
    cwd: backendPath,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: process.env.PORT || 10000
    }
  });

  child.on('error', (error) => {
    console.error('❌ Error starting application:', error);
    process.exit(1);
  });

  child.on('exit', (code) => {
    console.log(`🔄 Application exited with code ${code}`);
    process.exit(code);
  });

} catch (error) {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
} 