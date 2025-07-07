#!/usr/bin/env node

const https = require('https');
const http = require('http');

const SERVICES = [
  'https://kolnexus-backend.onrender.com/health',
  'https://kolnexus-telethon.onrender.com/health'
];

async function pingService(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https:') ? https : http;
    const request = protocol.get(url, (response) => {
      const statusOk = response.statusCode >= 200 && response.statusCode < 300;
      console.log(`${statusOk ? '✅' : '❌'} ${url} - Status: ${response.statusCode}`);
      resolve(statusOk);
    });

    request.on('error', (error) => {
      console.log(`❌ ${url} - Error: ${error.message}`);
      resolve(false);
    });

    request.setTimeout(10000, () => {
      console.log(`⏰ ${url} - Timeout`);
      request.destroy();
      resolve(false);
    });
  });
}

async function keepAlive() {
  console.log(`🏓 Keep-alive check at ${new Date().toISOString()}`);
  
  const results = await Promise.all(
    SERVICES.map(service => pingService(service))
  );

  const successCount = results.filter(Boolean).length;
  console.log(`📊 ${successCount}/${SERVICES.length} services responding`);
  console.log('---');
}

// Run immediately
keepAlive();

// Then run every 10 minutes
setInterval(keepAlive, 10 * 60 * 1000);

console.log('🔄 Keep-alive monitor started. Will ping services every 10 minutes.');
console.log('Press Ctrl+C to stop.'); 