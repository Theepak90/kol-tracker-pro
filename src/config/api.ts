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
    endpoint: import.meta.env.VITE_WS_ENDPOINT || 'wss://localhost:8080',
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
};

export const SUPPORTED_CHAINS = {
  ethereum: { id: 1, name: 'Ethereum', rpc: 'https://eth-mainnet.g.alchemy.com/v2' },
  bsc: { id: 56, name: 'BSC', rpc: 'https://bsc-dataseed.binance.org' },
  polygon: { id: 137, name: 'Polygon', rpc: 'https://polygon-rpc.com' },
  arbitrum: { id: 42161, name: 'Arbitrum', rpc: 'https://arb1.arbitrum.io/rpc' },
  optimism: { id: 10, name: 'Optimism', rpc: 'https://mainnet.optimism.io' },
  base: { id: 8453, name: 'Base', rpc: 'https://mainnet.base.org' },
};

// API Configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Development URLs (local)
const DEV_BACKEND_URL = 'http://localhost:3000';
const DEV_TELETHON_URL = 'http://localhost:8000';

// Production URLs - Using mock data for now until backend is deployed
const PROD_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://api.jsonbin.io/v3/b'; // Temporary mock API
const PROD_TELETHON_URL = import.meta.env.VITE_TELETHON_URL || 'https://api.jsonbin.io/v3/b'; // Temporary mock API

// Export the appropriate URLs based on environment
export const API_BASE_URL = isDevelopment ? DEV_BACKEND_URL : DEV_BACKEND_URL; // Use local for now
export const TELETHON_BASE_URL = isDevelopment ? DEV_TELETHON_URL : DEV_TELETHON_URL; // Use local for now

// WebSocket URL for games (if needed)
export const WS_URL = isDevelopment 
  ? 'ws://localhost:3000' 
  : `wss://${PROD_BACKEND_URL.replace('https://', '')}`;

console.log('🔧 API Configuration:', {
  environment: isDevelopment ? 'development' : 'production',
  backendURL: API_BASE_URL,
  telethonURL: TELETHON_BASE_URL,
  wsURL: WS_URL
});