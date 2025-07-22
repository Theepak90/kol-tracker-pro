#!/usr/bin/env node

/**
 * Keep-Alive Wrapper for KOL Tracker Backend
 * Ensures the backend service stays running on Render with auto-restart on failures
 */

const { spawn } = require('child_process');
const http = require('http');

// Configuration
const HEALTH_CHECK_INTERVAL = parseInt(process.env.HEALTH_CHECK_INTERVAL) || 300000; // 5 minutes
const RESTART_DELAY = 5000; // 5 seconds
const MAX_RESTART_ATTEMPTS = 10;
const RESTART_WINDOW = 3600000; // 1 hour

let restartCount = 0;
let lastRestartTime = 0;
let backendProcess = null;
let isShuttingDown = false;

// Colors for logging
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
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function startBackend() {
  if (isShuttingDown) return;

  log('🚀 Starting KOL Tracker Backend...', 'green');

  backendProcess = spawn('node', ['simple-server.js'], {
    stdio: ['inherit', 'inherit', 'inherit'],
    env: { ...process.env }
  });

  backendProcess.on('error', (error) => {
    log(`❌ Backend process error: ${error.message}`, 'red');
    restartBackend();
  });

  backendProcess.on('exit', (code, signal) => {
    if (isShuttingDown) {
      log('🛑 Backend shutdown complete', 'yellow');
      return;
    }

    if (code === 0) {
      log('✅ Backend exited gracefully', 'green');
    } else {
      log(`💥 Backend exited with code ${code} and signal ${signal}`, 'red');
      restartBackend();
    }
  });

  // Set up health check
  setTimeout(() => {
    if (!isShuttingDown) {
      startHealthCheck();
    }
  }, 30000); // Wait 30 seconds before starting health checks
}

function restartBackend() {
  if (isShuttingDown) return;

  const now = Date.now();
  
  // Reset restart count if enough time has passed
  if (now - lastRestartTime > RESTART_WINDOW) {
    restartCount = 0;
  }

  restartCount++;
  lastRestartTime = now;

  if (restartCount > MAX_RESTART_ATTEMPTS) {
    log(`🚨 Maximum restart attempts (${MAX_RESTART_ATTEMPTS}) reached within 1 hour. Stopping.`, 'red');
    process.exit(1);
  }

  log(`🔄 Restarting backend (attempt ${restartCount}/${MAX_RESTART_ATTEMPTS})...`, 'yellow');

  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill('SIGTERM');
  }

  setTimeout(() => {
    startBackend();
  }, RESTART_DELAY);
}

function performHealthCheck() {
  return new Promise((resolve) => {
    const port = process.env.PORT || 3000;
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/api/health',
      method: 'GET',
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        log(`⚠️  Health check failed with status: ${res.statusCode}`, 'yellow');
        resolve(false);
      }
    });

    req.on('error', (error) => {
      log(`⚠️  Health check error: ${error.message}`, 'yellow');
      resolve(false);
    });

    req.on('timeout', () => {
      log('⚠️  Health check timeout', 'yellow');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

function startHealthCheck() {
  if (isShuttingDown) return;

  setInterval(async () => {
    if (isShuttingDown) return;

    log('🏥 Performing health check...', 'cyan');
    
    const isHealthy = await performHealthCheck();
    
    if (isHealthy) {
      log('✅ Health check passed', 'green');
    } else {
      log('❌ Health check failed - restarting backend', 'red');
      restartBackend();
    }
  }, HEALTH_CHECK_INTERVAL);

  log(`🏥 Health check started (interval: ${HEALTH_CHECK_INTERVAL}ms)`, 'blue');
}

// Keep-alive ping to prevent Render from sleeping
function startKeepAlivePing() {
  if (process.env.KEEP_ALIVE !== 'true') return;

  setInterval(() => {
    if (isShuttingDown) return;

    const port = process.env.PORT || 3000;
    http.get(`http://localhost:${port}/api/health`, (res) => {
      // Consume response to avoid memory leaks
      res.on('data', () => {});
      res.on('end', () => {
        log('📍 Keep-alive ping sent', 'cyan');
      });
    }).on('error', (error) => {
      log(`Keep-alive ping failed: ${error.message}`, 'yellow');
    });
  }, 840000); // Ping every 14 minutes (Render free tier sleeps after 15 minutes)
}

// Graceful shutdown handlers
function gracefulShutdown(signal) {
  log(`🛑 Received ${signal}. Starting graceful shutdown...`, 'yellow');
  isShuttingDown = true;

  if (backendProcess && !backendProcess.killed) {
    log('🛑 Stopping backend process...', 'yellow');
    backendProcess.kill('SIGTERM');
    
    // Force kill after 30 seconds
    setTimeout(() => {
      if (!backendProcess.killed) {
        log('💀 Force killing backend process...', 'red');
        backendProcess.kill('SIGKILL');
      }
    }, 30000);
  }

  setTimeout(() => {
    log('👋 Shutdown complete', 'green');
    process.exit(0);
  }, 5000);
}

// Signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, 'red');
});

// Start the application
log('🌟 KOL Tracker Backend Keep-Alive Wrapper Starting...', 'magenta');
log(`📊 Configuration:`, 'blue');
log(`   - Health Check Interval: ${HEALTH_CHECK_INTERVAL}ms`, 'blue');
log(`   - Max Restart Attempts: ${MAX_RESTART_ATTEMPTS}`, 'blue');
log(`   - Keep Alive: ${process.env.KEEP_ALIVE === 'true' ? 'Enabled' : 'Disabled'}`, 'blue');

startBackend();
startKeepAlivePing(); 