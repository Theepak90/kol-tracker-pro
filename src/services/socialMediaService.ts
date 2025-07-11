import { API_CONFIG } from '../config/api';
import { APIService } from './apiService';
import { APIResponse, SocialMediaMetrics } from '../types/api';

class SocialMediaService {
  private twitterAPI: APIService;
  private discordAPI: APIService;

  constructor() {
    this.twitterAPI = new APIService({
      baseUrl: API_CONFIG.twitter.baseUrl,
      apiKey: API_CONFIG.twitter.bearerToken,
      headers: {
        'Authorization': `Bearer ${API_CONFIG.twitter.bearerToken}`,
      },
      retry: {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
      },
    }, 'twitter');

    this.discordAPI = new APIService({
      baseUrl: API_CONFIG.discord.baseUrl,
      apiKey: API_CONFIG.discord.botToken,
      headers: {
        'Authorization': `Bot ${API_CONFIG.discord.botToken}`,
      },
      retry: {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
      },
    }, 'discord');
  }

  async getTwitterUserMetrics(username: string): Promise<APIResponse<SocialMediaMetrics>> {
    try {
      // Get user data
      const userResponse = await this.twitterAPI.request<any>({
        method: 'GET',
        url: '/users/by/username/' + username,
        params: {
          'user.fields': 'public_metrics,verified',
        },
      });

      if (!userResponse.success || !userResponse.data?.data) {
        throw new Error('Failed to fetch Twitter user data');
      }

      const userData = userResponse.data.data;

      // Get recent tweets for engagement calculation
      const tweetsResponse = await this.twitterAPI.request<any>({
        method: 'GET',
        url: `/users/${userData.id}/tweets`,
        params: {
          max_results: 100,
          'tweet.fields': 'public_metrics',
        },
      });

      let engagementRate = 0;
      if (tweetsResponse.success && tweetsResponse.data?.data) {
        const tweets = tweetsResponse.data.data;
        const totalEngagements = tweets.reduce((sum: number, tweet: any) => {
          const metrics = tweet.public_metrics || {};
          return sum + (
            (metrics.like_count || 0) +
            (metrics.retweet_count || 0) +
            (metrics.reply_count || 0) +
            (metrics.quote_count || 0)
          );
        }, 0);
        
        engagementRate = tweets.length > 0 
          ? (totalEngagements / tweets.length) / userData.public_metrics.followers_count * 100
          : 0;
      }

      return {
        success: true,
        data: {
          platform: 'twitter',
          user_id: userData.id,
          username: userData.username,
          followers_count: userData.public_metrics.followers_count,
          following_count: userData.public_metrics.following_count,
          post_count: userData.public_metrics.tweet_count,
          engagement_rate: engagementRate,
          verified: userData.verified || false,
        },
        timestamp: Date.now(),
        meta: userResponse.meta,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  async getDiscordUserMetrics(userId: string): Promise<APIResponse<SocialMediaMetrics>> {
    try {
      const response = await this.discordAPI.request<any>({
        method: 'GET',
        url: `/users/${userId}`,
      });

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch Discord user data');
      }

      const userData = response.data;

      return {
        success: true,
        data: {
          platform: 'discord',
          user_id: userData.id,
          username: userData.username,
          followers_count: 0, // Discord doesn't have followers
          verified: userData.verified || false,
        },
        timestamp: Date.now(),
        meta: response.meta,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  async getDiscordGuildMetrics(guildId: string): Promise<APIResponse<{
    member_count: number;
    online_count: number;
    channel_count: number;
    role_count: number;
  }>> {
    try {
      const response = await this.discordAPI.request<any>({
        method: 'GET',
        url: `/guilds/${guildId}`,
        params: {
          with_counts: true,
        },
      });

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch Discord guild data');
      }

      const guildData = response.data;

      return {
        success: true,
        data: {
          member_count: guildData.approximate_member_count || 0,
          online_count: guildData.approximate_presence_count || 0,
          channel_count: guildData.channels?.length || 0,
          role_count: guildData.roles?.length || 0,
        },
        timestamp: Date.now(),
        meta: response.meta,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }
}

export const socialMediaService = new SocialMediaService();