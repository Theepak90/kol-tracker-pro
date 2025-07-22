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

// Try different possible startup configurations
const startupConfigs = [
  // Config 1: PRIORITY - Simple server approach (current)
  {
    cwd: path.join(process.cwd(), 'backend'),
    command: 'node',
    args: ['simple-server.js'],
    description: 'Simple Express server (PostgreSQL)'
  },
  // Config 2: Fallback - NPM simple start script
  {
    cwd: path.join(process.cwd(), 'backend'),
    command: 'npm',
    args: ['run', 'start:simple'],
    description: 'NPM start:simple script'
  },
  // Config 3: Alternative simple server path
  {
    cwd: process.cwd(),
    command: 'node',
    args: ['backend/simple-server.js'],
    description: 'Direct backend/simple-server.js'
  }
];

console.log('Checking startup configurations...');

let foundConfig = null;

for (const config of startupConfigs) {
  console.log(`🔍 Checking: ${config.description}`);
  
  // Check if the command/file exists
  if (config.command === 'node') {
    const scriptPath = path.join(config.cwd, config.args[0]);
    if (fileExists(scriptPath)) {
      foundConfig = config;
      console.log(`✅ Found: ${config.description}`);
      break;
    }
  } else if (config.command === 'npm') {
    // For npm scripts, check if package.json exists and script is available
    const packagePath = path.join(config.cwd, 'package.json');
    if (fileExists(packagePath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const scriptName = config.args[config.args.length - 1]; // Get last arg as script name
        if (packageJson.scripts && packageJson.scripts[scriptName]) {
          foundConfig = config;
          console.log(`✅ Found: ${config.description}`);
          break;
        }
      } catch (error) {
        // If we can't parse package.json, skip this config
        console.log(`⚠️  Could not verify script in package.json: ${error.message}`);
      }
    }
  }
}

if (!foundConfig) {
  console.error('❌ Could not find any viable startup configuration');
  console.log('Available files in backend directory:');
  try {
    const backendPath = path.join(process.cwd(), 'backend');
    if (fileExists(backendPath)) {
      const files = fs.readdirSync(backendPath);
      files.forEach(file => console.log(`  - ${file}`));
    }
  } catch (error) {
    console.error('Could not list backend directory contents');
  }
  process.exit(1);
}

// Start the application
console.log(`🚀 Starting with: ${foundConfig.description}`);
console.log(`📁 Working directory: ${foundConfig.cwd}`);
console.log(`🔧 Command: ${foundConfig.command} ${foundConfig.args.join(' ')}`);

try {
  const child = spawn(foundConfig.command, foundConfig.args, {
    cwd: foundConfig.cwd,
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