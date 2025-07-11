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
      const status = await this.checkStatus();
      
      if (!status.connected) {
      throw new Error('Telegram service is currently unavailable. Please ensure the service is running and try again.');
      }

      const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

    try {
      const response = await fetch(`${this.baseUrl}/scan/${username.replace('@', '')}`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 500) {
          const errorData = await response.text().catch(() => '');
          if (errorData.includes('not connected') || errorData.includes('client')) {
            throw new Error('Telegram client not connected: Service is reconnecting, please try again in a moment');
          }
          throw new Error('Channel access denied: Admin privileges required to scan this channel');
        } else if (response.status === 404) {
          throw new Error('Channel not found or is not accessible');
        } else if (response.status === 429) {
          throw new Error('Rate limited: Too many requests, please wait before trying again');
        } else {
        throw new Error(`Scan failed with status ${response.status}`);
        }
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout: Channel scan took too long to complete (30 seconds). Large channels or API rate limits can cause delays.');
        }
        if (error.message.includes('fetch')) {
          throw new Error('Connection failed: Unable to reach Telegram service. Please check your connection and try again.');
        }
      }
      throw error;
    }
  }

  async getEnhancedPosts(username: string): Promise<EnhancedPostsResponse> {
      const status = await this.checkStatus();
      
      if (!status.connected) {
      throw new Error('Telegram service is currently unavailable. Cannot fetch real-time posts data.');
      }

      const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

    try {
      const response = await fetch(`${this.baseUrl}/enhanced-posts/${username.replace('@', '')}`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 500) {
          const errorData = await response.text().catch(() => '');
          if (errorData.includes('not connected') || errorData.includes('client')) {
            throw new Error('Telegram client not connected: Service is reconnecting, please try again in a moment');
          }
          throw new Error('Channel access denied: Admin privileges required to fetch posts from this channel');
        } else if (response.status === 404) {
          throw new Error('Channel not found or posts are not accessible');
        } else if (response.status === 429) {
          throw new Error('Rate limited: Too many requests, please wait before trying again');
        } else {
        throw new Error(`Enhanced posts fetch failed with status ${response.status}`);
        }
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout: Posts fetch took too long to complete (30 seconds). Large channels or API rate limits can cause delays.');
        }
        if (error.message.includes('fetch')) {
          throw new Error('Connection failed: Unable to reach Telegram service. Please check your connection and try again.');
        }
      }
      throw error;
    }
  }

  async getVolumeData(username: string, days: number = 30): Promise<Record<string, VolumeData[]>> {
      const status = await this.checkStatus();
      
      if (!status.connected) {
      throw new Error('Telegram service is currently unavailable. Cannot fetch real-time volume data.');
      }

      const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30 seconds

    try {
      const response = await fetch(`${this.baseUrl}/track-volume/${username.replace('@', '')}?days=${days}`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 500) {
          throw new Error('Channel access denied: Admin privileges required to track volume for this channel');
        } else if (response.status === 404) {
          throw new Error('Channel not found or volume data is not available');
        } else {
        throw new Error(`Volume data fetch failed with status ${response.status}`);
        }
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout: Volume data fetch took too long to complete (30 seconds)');
      }
      throw error;
    }
  }

  async getScanHistory(username: string) {
      const status = await this.checkStatus();
      
      if (!status.connected) {
      throw new Error('Telegram service is currently unavailable. Cannot fetch scan history.');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${this.baseUrl}/scan-history/${username.replace('@', '')}`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 500) {
          throw new Error('Channel access denied: Admin privileges required to access scan history for this channel');
        } else if (response.status === 404) {
          throw new Error('Channel not found or scan history is not available');
        } else {
        throw new Error(`Scan history fetch failed with status ${response.status}`);
        }
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout: Scan history fetch took too long to complete');
      }
      throw error;
    }
  }

  getConnectionStatus(): boolean {
    return this.isOnline;
  }
}

export const telegramService = new TelegramService();