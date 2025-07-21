#!/usr/bin/env node

/**
 * MongoDB Connection Troubleshooting and Fix Script
 * Helps diagnose and resolve MongoDB connection issues
 */

const { MongoClient } = require('mongodb');
const dns = require('dns');
const https = require('https');

// Color output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function checkDNSResolution(hostname) {
  return new Promise((resolve) => {
    dns.lookup(hostname, (err, address) => {
      if (err) {
        resolve({ success: false, error: err.message });
      } else {
        resolve({ success: true, address });
      }
    });
  });
}

async function checkInternetConnectivity() {
  return new Promise((resolve) => {
    const request = https.request('https://google.com', { timeout: 5000 }, (res) => {
      resolve({ success: true, status: res.statusCode });
    });
    
    request.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
    
    request.on('timeout', () => {
      resolve({ success: false, error: 'Request timeout' });
    });
    
    request.end();
  });
}

async function testMongoDBConnection(uri) {
  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority'
    });

    await client.connect();
    await client.db().admin().ping();
    await client.close();
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function generateAlternativeURIs(originalUri) {
  const alternatives = [];
  
  // If using SRV, try without it
  if (originalUri.includes('mongodb+srv://')) {
    const modified = originalUri.replace('mongodb+srv://', 'mongodb://');
    alternatives.push({
      description: 'Direct connection (no SRV)',
      uri: modified
    });
  }
  
  // Try with different timeout settings
  const baseUri = originalUri.split('?')[0];
  alternatives.push({
    description: 'Extended timeouts',
    uri: `${baseUri}?retryWrites=true&w=majority&serverSelectionTimeoutMS=30000&connectTimeoutMS=30000&socketTimeoutMS=60000`
  });
  
  // Try with SSL disabled (for testing only)
  alternatives.push({
    description: 'SSL disabled (testing only)',
    uri: `${baseUri}?retryWrites=true&w=majority&ssl=false`
  });
  
  return alternatives;
}

async function main() {
  log('\n🔍 MongoDB Connection Troubleshooting Tool', 'cyan');
  log('==========================================\n', 'cyan');
  
  // Get MongoDB URI from environment or use default
  const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://theepakkumar187:XP3YPWryQfSGDeKM@cluster0.rvhxt.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority';
  
  logInfo(`Testing MongoDB URI: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
  
  // Step 1: Check internet connectivity
  log('\n1. Checking internet connectivity...');
  const internetCheck = await checkInternetConnectivity();
  if (internetCheck.success) {
    logSuccess(`Internet connection available (Status: ${internetCheck.status})`);
  } else {
    logError(`Internet connectivity issue: ${internetCheck.error}`);
    logWarning('Please check your internet connection before proceeding.');
    return;
  }
  
  // Step 2: Extract hostname for DNS check
  log('\n2. Checking DNS resolution...');
  let hostname;
  try {
    const url = new URL(mongoUri.replace('mongodb+srv://', 'https://').replace('mongodb://', 'https://'));
    hostname = url.hostname;
    logInfo(`Extracted hostname: ${hostname}`);
  } catch (error) {
    logError(`Failed to parse MongoDB URI: ${error.message}`);
    return;
  }
  
  // Check DNS resolution
  const dnsCheck = await checkDNSResolution(hostname);
  if (dnsCheck.success) {
    logSuccess(`DNS resolution successful: ${hostname} → ${dnsCheck.address}`);
  } else {
    logError(`DNS resolution failed: ${dnsCheck.error}`);
    
    // Try alternative DNS servers
    log('\n   Trying alternative DNS resolution methods...');
    
    // Check if it's an SRV record issue
    if (mongoUri.includes('mongodb+srv://')) {
      const srvRecord = `_mongodb._tcp.${hostname}`;
      logInfo(`SRV record being queried: ${srvRecord}`);
      
      const srvCheck = await checkDNSResolution(srvRecord);
      if (!srvCheck.success) {
        logError(`SRV record lookup failed: ${srvCheck.error}`);
        logWarning('This is likely the root cause of the connection issue.');
      }
    }
  }
  
  // Step 3: Test MongoDB connection
  log('\n3. Testing MongoDB connection...');
  const connectionTest = await testMongoDBConnection(mongoUri);
  
  if (connectionTest.success) {
    logSuccess('MongoDB connection successful!');
    log('\n🎉 Connection test passed. Your MongoDB setup is working correctly.', 'green');
    return;
  } else {
    logError(`MongoDB connection failed: ${connectionTest.error}`);
  }
  
  // Step 4: Try alternative connection methods
  log('\n4. Trying alternative connection methods...');
  const alternatives = generateAlternativeURIs(mongoUri);
  
  for (const alt of alternatives) {
    log(`\n   Testing: ${alt.description}`);
    const altTest = await testMongoDBConnection(alt.uri);
    
    if (altTest.success) {
      logSuccess(`Alternative connection successful: ${alt.description}`);
      log(`\n📝 Recommended URI: ${alt.uri}`, 'green');
      break;
    } else {
      logWarning(`Alternative failed: ${altTest.error}`);
    }
  }
  
  // Step 5: Provide troubleshooting recommendations
  log('\n📋 Troubleshooting Recommendations:', 'yellow');
  log('=====================================\n', 'yellow');
  
  if (dnsCheck.success) {
    log('✓ DNS resolution is working');
  } else {
    logError('✗ DNS resolution issues detected');
    log('  • Try using a different DNS server (8.8.8.8, 1.1.1.1)');
    log('  • Check if you\'re behind a corporate firewall');
    log('  • Verify your network allows external DNS queries');
  }
  
  if (mongoUri.includes('mongodb+srv://')) {
    log('\n🔧 SRV Record Issues:');
    log('  • SRV records may not be properly configured');
    log('  • Try using a direct connection string instead');
    log('  • Contact your MongoDB Atlas support team');
  }
  
  log('\n🛠️  General Fixes:');
  log('  1. Check MongoDB Atlas IP whitelist settings');
  log('  2. Verify your username and password are correct');
  log('  3. Ensure your cluster is not paused');
  log('  4. Try connecting from a different network');
  log('  5. Contact MongoDB Atlas support if issues persist');
  
  log('\n⚙️  Environment Configuration:');
  log('  • Make sure MONGODB_URI environment variable is properly set');
  log('  • Verify the connection string format is correct');
  log('  • Check for any special characters that need URL encoding');
  
  // Step 6: Generate improved configuration
  log('\n📄 Improved Backend Configuration:', 'cyan');
  log('==================================\n', 'cyan');
  
  const improvedConfig = `
// Enhanced MongoDB configuration for production
const MONGODB_OPTIONS = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
  w: 'majority',
  // Add these for better stability
  maxIdleTimeMS: 30000,
  serverSelectionRetryDelayMS: 2000,
  heartbeatFrequencyMS: 10000
};

// Connection with retry logic
async function connectToMongoDB(maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(\`Attempting MongoDB connection (\${attempt}/\${maxRetries})...\`);
      const client = new MongoClient(MONGODB_URI, MONGODB_OPTIONS);
      await client.connect();
      await client.db().admin().ping();
      console.log('✅ MongoDB connected successfully');
      return client;
    } catch (error) {
      console.error(\`❌ Connection attempt \${attempt} failed: \${error.message}\`);
      
      if (attempt === maxRetries) {
        console.error('🛑 Maximum retry attempts reached. Using fallback mode.');
        return null;
      }
      
      // Exponential backoff
      const delay = Math.min(30000, 1000 * Math.pow(2, attempt));
      console.log(\`🔄 Retrying in \${delay / 1000} seconds...\`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}`;
  
  log(improvedConfig, 'cyan');
  
  log('\n🔗 Useful Resources:', 'magenta');
  log('===================\n', 'magenta');
  log('• MongoDB Atlas Connection Troubleshooting: https://docs.atlas.mongodb.com/troubleshoot-connection/');
  log('• Network Connectivity Issues: https://docs.atlas.mongodb.com/security-add-ip-address-to-list/');
  log('• DNS Configuration: https://docs.atlas.mongodb.com/reference/faq/connection-changes/');
  
  log('\n🎯 Next Steps:', 'blue');
  log('==============\n', 'blue');
  log('1. Try the improved configuration above');
  log('2. Check MongoDB Atlas dashboard for cluster status');
  log('3. Verify network access settings in Atlas');
  log('4. Test from a different network if possible');
  log('5. Contact support if issues persist');
}

// Run the troubleshooting tool
if (require.main === module) {
  main().catch(error => {
    logError(`Troubleshooting tool error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { testMongoDBConnection, checkDNSResolution, checkInternetConnectivity }; 