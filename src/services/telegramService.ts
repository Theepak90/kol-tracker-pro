import { API_CONFIG } from '../config/api';

interface TelegramStatus {
  connected: boolean;
  uptime?: number;
}

interface VolumeData {
  timestamp: string;
  volume: number;
  price: number;
  token_address?: string;
  chain?: string;
}

interface EnhancedPost {
  message_id: number;
  text: string;
  date: string;
  views: number;
  forwards: number;
  channel_id?: number;
  channel_title?: string;
  volume_data?: VolumeData;
  sentiment_score?: number;
  engagement_rate?: number;
}

interface EnhancedPostsResponse {
  username: string;
  posts: EnhancedPost[];
  total_posts: number;
  total_views: number;
  total_forwards: number;
  total_volume: number;
  average_sentiment: number;
  peak_engagement: number;
}

// Demo data for when Telegram service is unavailable
const DEMO_CHANNEL_INFO = {
  title: 'Demo Channel',
  username: 'demo_channel',
  description: 'This is a demo channel - Telegram service is currently unavailable',
  member_count: 1000,
  kol_details: []
};

const DEMO_POSTS: EnhancedPost[] = [
  {
    message_id: 1,
    text: '🚀 Demo post: Bitcoin analysis shows strong support at $45,000. This is demo data since Telegram service is unavailable.',
    date: new Date().toISOString(),
    views: 2500,
    forwards: 150,
    channel_id: 1,
    channel_title: 'Demo Channel',
    sentiment_score: 0.8,
    engagement_rate: 6.0
  },
  {
    message_id: 2,
    text: '📈 Demo post: Ethereum showing bullish patterns. Remember this is demo data for testing purposes.',
    date: new Date(Date.now() - 3600000).toISOString(),
    views: 1800,
    forwards: 95,
    channel_id: 1,
    channel_title: 'Demo Channel',
    sentiment_score: 0.7,
    engagement_rate: 5.3
  }
];

class TelegramService {
  private baseUrl: string;
  private isOnline: boolean = false;
  private lastStatusCheck: number = 0;
  private statusCacheTime: number = 30000; // 30 seconds

  constructor() {
    this.baseUrl = API_CONFIG.TELETHON_SERVICE.BASE_URL;
  }

  async checkStatus(): Promise<TelegramStatus> {
    const now = Date.now();
    
    // Use cached status if recent
    if (now - this.lastStatusCheck < this.statusCacheTime) {
      return { connected: this.isOnline };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        this.isOnline = true;
        this.lastStatusCheck = now;
        return { connected: true };
      } else {
        throw new Error(`Service returned ${response.status}`);
      }
    } catch (error) {
      console.warn('🔌 Telegram service unavailable:', error);
      this.isOnline = false;
      this.lastStatusCheck = now;
      return { connected: false };
    }
  }

  async scanChannel(username: string) {
    try {
      const status = await this.checkStatus();
      
      if (!status.connected) {
        console.log('📱 Using demo channel data - Telegram service unavailable');
        return {
          ...DEMO_CHANNEL_INFO,
          username: username.replace('@', ''),
          title: `Demo: ${username}`,
          description: `Demo channel data for ${username} - Telegram service is currently unavailable`
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${this.baseUrl}/scan/${username.replace('@', '')}`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Scan failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Channel scan failed:', error);
      console.log('📱 Using demo channel data as fallback');
      return {
        ...DEMO_CHANNEL_INFO,
        username: username.replace('@', ''),
        title: `Demo: ${username}`,
        description: `Demo channel data for ${username} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async getEnhancedPosts(username: string): Promise<EnhancedPostsResponse> {
    try {
      const status = await this.checkStatus();
      
      if (!status.connected) {
        console.log('📱 Using demo posts data - Telegram service unavailable');
        return {
          username: username.replace('@', ''),
          posts: DEMO_POSTS,
          total_posts: DEMO_POSTS.length,
          total_views: DEMO_POSTS.reduce((sum, post) => sum + post.views, 0),
          total_forwards: DEMO_POSTS.reduce((sum, post) => sum + post.forwards, 0),
          total_volume: 0,
          average_sentiment: 0.75,
          peak_engagement: 6.0
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${this.baseUrl}/enhanced-posts/${username.replace('@', '')}`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Enhanced posts fetch failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Enhanced posts fetch failed:', error);
      console.log('📱 Using demo posts data as fallback');
      return {
        username: username.replace('@', ''),
        posts: DEMO_POSTS,
        total_posts: DEMO_POSTS.length,
        total_views: DEMO_POSTS.reduce((sum, post) => sum + post.views, 0),
        total_forwards: DEMO_POSTS.reduce((sum, post) => sum + post.forwards, 0),
        total_volume: 0,
        average_sentiment: 0.75,
        peak_engagement: 6.0
      };
    }
  }

  async getVolumeData(username: string, days: number = 30): Promise<Record<string, VolumeData[]>> {
    try {
      const status = await this.checkStatus();
      
      if (!status.connected) {
        console.log('📱 Using demo volume data - Telegram service unavailable');
        return {
          '0x1234567890123456789012345678901234567890': [
            {
              timestamp: new Date().toISOString(),
              volume: 1500000,
              price: 0.0045,
              token_address: '0x1234567890123456789012345678901234567890',
              chain: 'ethereum'
            }
          ]
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${this.baseUrl}/track-volume/${username.replace('@', '')}?days=${days}`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Volume data fetch failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Volume data fetch failed:', error);
      console.log('📱 Using demo volume data as fallback');
      return {
        '0x1234567890123456789012345678901234567890': [
          {
            timestamp: new Date().toISOString(),
            volume: 1500000,
            price: 0.0045,
            token_address: '0x1234567890123456789012345678901234567890',
            chain: 'ethereum'
          }
        ]
      };
    }
  }

  async getScanHistory(username: string) {
    try {
      const status = await this.checkStatus();
      
      if (!status.connected) {
        console.log('📱 Using demo scan history - Telegram service unavailable');
        return [];
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.baseUrl}/scan-history/${username.replace('@', '')}`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Scan history fetch failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Scan history fetch failed:', error);
      console.log('📱 Using demo scan history as fallback');
      return [];
    }
  }

  getConnectionStatus(): boolean {
    return this.isOnline;
  }
}

export const telegramService = new TelegramService();