// API Configuration
const isDevelopment = import.meta.env.DEV;

// Development URLs (local)
const DEV_BACKEND_URL = 'http://localhost:3000';
const DEV_TELETHON_URL = 'http://localhost:8000';
const DEV_WS_URL = 'ws://localhost:3000';

// Production URLs
const PROD_BACKEND_URL = import.meta.env.VITE_API_URL || 'https://kolnexus-backend.onrender.com';
const PROD_TELETHON_URL = import.meta.env.VITE_TELETHON_SERVICE_URL || 'https://kolnexus-telethon.onrender.com';
const PROD_WS_URL = import.meta.env.VITE_WS_ENDPOINT || 'wss://kolnexus-backend.onrender.com';

// Export the appropriate URLs based on environment
export const API_BASE_URL = isDevelopment ? DEV_BACKEND_URL : PROD_BACKEND_URL;
export const TELETHON_BASE_URL = isDevelopment ? DEV_TELETHON_URL : PROD_TELETHON_URL;
export const WS_URL = isDevelopment ? DEV_WS_URL : PROD_WS_URL;

// Ensure URLs are properly formatted
export const ensureHttps = (url: string) => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

export const ensureWss = (url: string) => {
  return url.replace('http://', 'ws://').replace('https://', 'wss://');
};

// Export configuration with proper URL formatting
export const API_CONFIG = {
  // Telegram
  telegram: {
    botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN,
    apiId: import.meta.env.VITE_TELEGRAM_API_ID,
    apiHash: import.meta.env.VITE_TELEGRAM_API_HASH,
    baseUrl: 'https://api.telegram.org/bot',
    mtProto: {
      baseUrl: 'https://api.telegram.org',
      test: false, // Set to true for testnet
      useWSS: true,
    },
    endpoints: {
      getChat: '/getChat',
      getChatMembers: '/getChatMemberCount',
      getChatAdmins: '/getChatAdministrators',
      getMessages: '/getMessages',
      detectBots: '/detectBots',
      analyzeChannel: '/analyzeChannel',
    },
    limits: {
      maxMessagesFetch: 1000,
      maxMembersFetch: 10000,
      analysisTimeWindow: 7 * 24 * 60 * 60, // 7 days in seconds
    },
  },

  // Blockchain
  moralis: {
    apiKey: import.meta.env.VITE_MORALIS_API_KEY,
    baseUrl: 'https://deep-index.moralis.io/api/v2',
  },
  
  alchemy: {
    apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
    baseUrl: 'https://eth-mainnet.g.alchemy.com/v2',
  },

  quicknode: {
    endpoint: import.meta.env.VITE_QUICKNODE_ENDPOINT,
  },

  // Social Media
  twitter: {
    bearerToken: import.meta.env.VITE_TWITTER_BEARER_TOKEN,
    baseUrl: 'https://api.twitter.com/2',
  },

  discord: {
    botToken: import.meta.env.VITE_DISCORD_BOT_TOKEN,
    baseUrl: 'https://discord.com/api/v10',
  },

  // AI/ML
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    baseUrl: 'https://api.openai.com/v1',
  },

  googleCloud: {
    apiKey: import.meta.env.VITE_GOOGLE_CLOUD_API_KEY,
    baseUrl: 'https://language.googleapis.com/v1',
  },

  // Market Data
  coingecko: {
    apiKey: import.meta.env.VITE_COINGECKO_API_KEY,
    baseUrl: 'https://api.coingecko.com/api/v3',
  },

  dextools: {
    apiKey: import.meta.env.VITE_DEXTOOLS_API_KEY,
    baseUrl: 'https://www.dextools.io/shared/data',
  },

  dexscreener: {
    baseUrl: 'https://api.dexscreener.com/latest',
  },

  // WebSocket
  websocket: {
    endpoint: ensureWss(WS_URL),
    options: {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    }
  },

  // Rate Limits
  rateLimits: {
    telegram: { requests: 30, window: 60000 }, // 30 requests per minute
    moralis: { requests: 25, window: 60000 },
    twitter: { requests: 300, window: 900000 }, // 300 requests per 15 minutes
    coingecko: { requests: 50, window: 60000 },
    openai: { requests: 60, window: 60000 },
  },

  auth: {
    baseUrl: '/api',
  },

  TELETHON_SERVICE: {
    BASE_URL: ensureHttps(TELETHON_BASE_URL),
    ENDPOINTS: {
      HEALTH: '/health',
      SCAN_CHANNEL: (username: string) => `/scan/${username}`,
      SCAN_HISTORY: (username: string) => `/scan-history/${username}`,
      TRACK_POSTS: (username: string) => `/track-posts/${username}`
    }
  }
};

// Export chain configurations
export const SUPPORTED_CHAINS = {
  ethereum: { id: 1, name: 'Ethereum', rpc: 'https://eth-mainnet.g.alchemy.com/v2' },
  bsc: { id: 56, name: 'BSC', rpc: 'https://bsc-dataseed.binance.org' },
  polygon: { id: 137, name: 'Polygon', rpc: 'https://polygon-rpc.com' },
  arbitrum: { id: 42161, name: 'Arbitrum', rpc: 'https://arb1.arbitrum.io/rpc' },
  optimism: { id: 10, name: 'Optimism', rpc: 'https://mainnet.optimism.io' },
  base: { id: 8453, name: 'Base', rpc: 'https://mainnet.base.org' },
};

console.log('🔧 API Configuration:', {
  environment: isDevelopment ? 'development' : 'production',
  backendURL: API_BASE_URL,
  telethonURL: TELETHON_BASE_URL,
  wsURL: WS_URL,
  formattedWsURL: ensureWss(WS_URL)
});