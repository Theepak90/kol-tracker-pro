#!/usr/bin/env node

/**
 * Restore script to switch back to production URLs for kolopz.com
 * Run this when you want to deploy to production
 */

const fs = require('fs');
const path = require('path');

const apiConfigPath = path.join(__dirname, 'src', 'config', 'api.ts');

console.log('🚀 Switching to production URLs for kolopz.com...');

// Read the current config
let content = fs.readFileSync(apiConfigPath, 'utf8');

// Replace the FORCE_LOCAL flag
content = content.replace(
  'const FORCE_LOCAL = true;',
  'const FORCE_LOCAL = false;'
);

// Write back the file
fs.writeFileSync(apiConfigPath, content);

console.log('✅ Updated API configuration to use production URLs');
console.log('📡 Your app will now connect to:');
console.log('   - Backend: https://api.kolopz.com');
console.log('   - Telethon: https://telethon.kolopz.com');
console.log('   - WebSocket: wss://api.kolopz.com');
console.log('');
console.log('⚠️  Make sure these production services are deployed:');
console.log('   1. Backend API at api.kolopz.com');
console.log('   2. Telethon service at telethon.kolopz.com');
console.log('   3. Set environment variables in your deployment platform');
console.log('');
console.log('📖 See KOLOPZ_DEPLOYMENT_GUIDE.md for detailed instructions');
console.log('🔄 To test with localhost again, run: node fix-localhost-urls.js'); 