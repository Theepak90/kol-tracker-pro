#!/usr/bin/env node

/**
 * Quick fix script to temporarily use localhost URLs
 * Run this when you want to test with local backend services
 */

const fs = require('fs');
const path = require('path');

const apiConfigPath = path.join(__dirname, 'src', 'config', 'api.ts');

console.log('🔧 Switching to localhost URLs for testing...');

// Read the current config
let content = fs.readFileSync(apiConfigPath, 'utf8');

// Replace the FORCE_LOCAL flag
content = content.replace(
  'const FORCE_LOCAL = false;',
  'const FORCE_LOCAL = true;'
);

// Write back the file
fs.writeFileSync(apiConfigPath, content);

console.log('✅ Updated API configuration to use localhost URLs');
console.log('📡 Your app will now connect to:');
console.log('   - Backend: http://localhost:3000');
console.log('   - Telethon: http://localhost:8000');
console.log('   - WebSocket: ws://localhost:3000');
console.log('');
console.log('⚠️  Make sure your local services are running:');
console.log('   npm run start:simple (in backend/ folder)');
console.log('   python3 main.py (in backend/telethon_service/ folder)');
console.log('');
console.log('🔄 To revert back to production URLs, run: node restore-production-urls.js'); 