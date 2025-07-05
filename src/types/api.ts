export interface TelegramMessage {
  id: number;
  date: number;
  message: string;
  from_id?: number;
  peer_id: {
    channel_id?: number;
    user_id?: number;
  };
  views?: number;
  forwards?: number;
  replies?: {
    replies: number;
  };
}

export interface TelegramChannel {
  id: number;
  title: string;
  username?: string;
  participants_count: number;
  about?: string;
  date: number;
}

export interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  verified?: boolean;
  bot?: boolean;
}

export interface BlockchainTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  block_number: number;
  gas_used: string;
  gas_price: string;
  chain?: string;
}

export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  total_supply: string;
  price_usd: number;
  market_cap: number;
  volume_24h: number;
  price_change_24h: number;
  chain?: string;
}

export interface VolumeData {
  timestamp: number;
  volume_1m: number;
  volume_5m: number;
  volume_10m: number;
  price_change_1m: number;
  price_change_5m: number;
  price_change_10m: number;
}

export interface TwitterMetrics {
  tweet_id: string;
  user_id: string;
  username: string;
  followers_count: number;
  following_count: number;
  tweet_count: number;
  like_count: number;
  retweet_count: number;
  reply_count: number;
  created_at: string;
}

export interface KOLAnalytics {
  user_id: string;
  username: string;
  platform: 'telegram' | 'twitter' | 'discord';
  followers: number;
  engagement_rate: number;
  post_frequency: number;
  win_rate: number;
  avg_volume: number;
  total_calls: number;
  verified: boolean;
  bot_score: number;
  specialty: string[];
}

export interface CallAnalysis {
  id: string;
  kol_id: string;
  token_address: string;
  token_symbol: string;
  call_timestamp: number;
  volume_before: VolumeData;
  volume_after: VolumeData;
  price_impact: number;
  success: boolean;
  confidence_score: number;
}

export interface BotDetectionResult {
  user_id: string;
  username: string;
  bot_probability: number;
  detection_reasons: string[];
  account_age: number;
  posting_pattern_score: number;
  engagement_authenticity: number;
  profile_completeness: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
  meta?: {
    rate_limit_remaining?: number;
    rate_limit_reset?: number;
  };
}

export interface WebSocketMessage {
  type: 'volume_spike' | 'new_call' | 'bot_detected' | 'price_alert';
  data: any;
  timestamp: number;
}

export interface SocialMediaMetrics {
  platform: 'telegram' | 'twitter' | 'discord';
  user_id: string;
  username: string;
  followers_count: number;
  following_count?: number;
  post_count?: number;
  engagement_rate?: number;
  verified?: boolean;
}

export interface APIError extends Error {
  status?: number;
  code?: string;
  rate_limit_remaining?: number;
  rate_limit_reset?: number;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export interface APIConfig {
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
  timeout?: number;
  retry?: RetryConfig;
}