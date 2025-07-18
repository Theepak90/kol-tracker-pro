#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting KOL Tracker Pro on Render...');
console.log('Current directory:', process.cwd());
console.log('Script location:', __dirname);

// Function to check if file exists
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
};

// Try different possible paths for the backend
const possiblePaths = [
  // Path 1: Standard structure
  {
    cwd: path.join(process.cwd(), 'backend'),
    script: 'dist/main.js'
  },
  // Path 2: If we're already in backend directory
  {
    cwd: process.cwd(),
    script: 'dist/main.js'
  },
  // Path 3: If backend is in src folder (Render structure)
  {
    cwd: path.join(process.cwd(), 'src', 'backend'),
    script: 'dist/main.js'
  },
  // Path 4: Alternative nested structure
  {
    cwd: path.join(process.cwd(), 'backend'),
    script: 'backend/dist/main.js'
  }
];

console.log('Looking for backend files in possible locations...');

let foundPath = null;

for (const pathConfig of possiblePaths) {
  const fullPath = path.join(pathConfig.cwd, pathConfig.script);
  console.log(`🔍 Checking: ${fullPath}`);
  
  if (fileExists(fullPath)) {
    foundPath = pathConfig;
    console.log(`✅ Found backend at: ${fullPath}`);
    break;
  }
}

if (!foundPath) {
  console.error('❌ Could not find backend main.js file in any expected location');
  console.log('Available files in current directory:');
  try {
    const files = fs.readdirSync(process.cwd());
    files.forEach(file => console.log(`  - ${file}`));
  } catch (error) {
    console.error('Could not list directory contents');
  }
  process.exit(1);
}

// Start the application
console.log(`🚀 Starting backend from: ${foundPath.cwd}`);
console.log(`📝 Script: ${foundPath.script}`);

try {
  const child = spawn('node', [foundPath.script], {
    cwd: foundPath.cwd,
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

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('📋 Received SIGTERM, shutting down gracefully...');
    child.kill('SIGTERM');
  });

  process.on('SIGINT', () => {
    console.log('📋 Received SIGINT, shutting down gracefully...');
    child.kill('SIGINT');
  });

} catch (error) {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
} 