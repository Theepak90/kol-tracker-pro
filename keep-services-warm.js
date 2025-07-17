const https = require('https');
const http = require('http');

// Service URLs
const BACKEND_URL = 'https://kol-tracker-backend.onrender.com/api';
const TELETHON_URL = 'https://kol-tracker-telethon.onrender.com/health';

// Function to ping a service
function pingService(url, serviceName) {
  const startTime = Date.now();
  
  https.get(url, (res) => {
    const responseTime = Date.now() - startTime;
    console.log(`✅ ${serviceName} - Status: ${res.statusCode} - Response time: ${responseTime}ms`);
  }).on('error', (err) => {
    console.log(`❌ ${serviceName} - Error: ${err.message}`);
  });
}

// Function to keep services warm
function keepServicesWarm() {
  console.log(`🔄 Pinging services at ${new Date().toISOString()}`);
  
  pingService(BACKEND_URL, 'Backend');
  pingService(TELETHON_URL, 'Telethon');
  
  console.log('---');
}

// Ping services immediately
keepServicesWarm();

// Ping services every 10 minutes (600000ms)
setInterval(keepServicesWarm, 10 * 60 * 1000);

console.log('🚀 Keep-alive service started!');
console.log('📱 Backend URL:', BACKEND_URL);
console.log('🤖 Telethon URL:', TELETHON_URL);
console.log('⏰ Pinging every 10 minutes...'); 