import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface TelegramStatus {
  connected: boolean;
  uptime?: number;
  lastCheck: string;
}

interface ChannelInfo {
  title: string;
  username: string;
  description: string;
  member_count: number;
  kol_details: Array<{
    user_id: number;
    username: string;
    first_name: string;
    last_name?: string;
    is_admin: boolean;
  }>;
}

interface Post {
  message_id: number;
  text: string;
  date: string;
  views: number;
  forwards: number;
  channel_id: number;
  channel_title: string;
}

interface PostData {
  posts: Post[];
  total_posts: number;
  total_views: number;
  total_forwards: number;
}

class TelegramService {
  private readonly telethonUrl: string;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000;

  constructor() {
    this.telethonUrl = API_BASE_URL;
  }

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (retries > 0 && axios.isAxiosError(error)) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.retryRequest(requestFn, retries - 1);
      }
      throw error;
    }
  }

  async checkStatus(): Promise<TelegramStatus> {
    try {
      const response = await this.retryRequest(() =>
        axios.get(`${this.telethonUrl}/api/telegram-status`, { timeout: 5000 })
      );
      return {
        connected: true,
        uptime: response.data.uptime,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      console.error('Telegram service status check failed:', error);
      return {
        connected: false,
        lastCheck: new Date().toISOString()
      };
    }
  }

  async scanChannel(channelName: string): Promise<ChannelInfo> {
    try {
      const cleanChannelName = channelName.replace('@', '');
      const response = await this.retryRequest(() =>
        axios.get(`${this.telethonUrl}/api/scan/${cleanChannelName}`)
      );
      return response.data;
    } catch (error) {
      console.error('Channel scan failed:', error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Channel not found. Please check the channel name and try again.');
      }
      throw new Error('Failed to scan channel. Please ensure the channel is public and try again.');
    }
  }

  async trackUserPosts(username: string): Promise<PostData> {
    try {
      const cleanUsername = username.replace('@', '');
      const response = await this.retryRequest(() =>
        axios.get(`${this.telethonUrl}/api/track-posts/${cleanUsername}`)
      );
      
      // Transform and validate the response data
      const data = response.data;
      return {
        posts: Array.isArray(data.posts) ? data.posts.map((post: any): Post => ({
          message_id: post.message_id || 0,
          text: post.text || '',
          date: post.date || new Date().toISOString(),
          views: post.views || 0,
          forwards: post.forwards || 0,
          channel_id: post.channel_id || 0,
          channel_title: post.channel_title || username
        })) : [],
        total_posts: data.total_posts || 0,
        total_views: data.total_views || 0,
        total_forwards: data.total_forwards || 0
      };
    } catch (error) {
      console.error('Post tracking failed:', error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('User not found. Please check the username and try again.');
      }
      throw new Error('Failed to track posts. Please try again later.');
    }
  }

  // Helper method to validate and clean channel/user names
  private validateUsername(username: string): string {
    const cleaned = username.replace('@', '').trim();
    if (!cleaned) {
      throw new Error('Please provide a valid username');
    }
    if (cleaned.includes(' ')) {
      throw new Error('Username cannot contain spaces');
    }
    return cleaned;
  }
}

export const telegramService = new TelegramService();