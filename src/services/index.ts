export { telegramService } from './telegramService';
export { blockchainService } from './blockchainService';
export { marketDataService } from './marketDataService';
export { aiAnalysisService } from './aiAnalysisService';
export { socialMediaService } from './socialMediaService';
export { websocketService } from './websocketService';
export { rateLimitService } from './rateLimitService';

// Main API orchestrator
import { telegramService } from './telegramService';
import { blockchainService } from './blockchainService';
import { marketDataService } from './marketDataService';
import { aiAnalysisService } from './aiAnalysisService';
import { socialMediaService } from './socialMediaService';
import { websocketService } from './websocketService';
import { rateLimitService } from './rateLimitService';
import { KOLAnalytics, CallAnalysis, APIResponse } from '../types/api';

class KOLTrackerAPI {
  constructor() {
    // Initialize WebSocket connection
    websocketService.connect();
  }

  async analyzeChannel(channelUsername: string): Promise<APIResponse<{
    channelInfo: any;
    memberCount: number;
    botPercentage: number;
    kolCount: number;
    suspiciousActivity: boolean;
  }>> {
    try {
      // Check rate limits
      if (!(await rateLimitService.checkRateLimit('telegram'))) {
        await rateLimitService.waitForRateLimit('telegram');
      }

      const [channelInfo, memberCount] = await Promise.all([
        telegramService.getChannelInfo(channelUsername),
        telegramService.getChannelMembers(channelUsername)
      ]);

      if (!channelInfo.success || !memberCount.success) {
        throw new Error('Failed to fetch channel data');
      }

      // Simulate bot detection and KOL analysis
      const botPercentage = Math.random() * 30; // 0-30% bots
      const kolCount = Math.floor(Math.random() * 25) + 5; // 5-30 KOLs
      const suspiciousActivity = botPercentage > 20;

      return {
        success: true,
        data: {
          channelInfo: channelInfo.data,
          memberCount: memberCount.data || 0,
          botPercentage,
          kolCount,
          suspiciousActivity
        },
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  async analyzeKOL(username: string, platform: 'telegram' | 'twitter' = 'telegram'): Promise<APIResponse<KOLAnalytics>> {
    try {
      let analytics: KOLAnalytics;

      if (platform === 'twitter') {
        const metrics = await socialMediaService.getTwitterUserMetrics(username);
        if (!metrics.success || !metrics.data) {
          throw new Error('Failed to fetch Twitter metrics');
        }

        analytics = {
          user_id: metrics.data.user_id,
          username: metrics.data.username,
          platform: 'twitter',
          followers: metrics.data.followers_count,
          engagement_rate: 0, // Will be calculated from tweets
          post_frequency: 0,
          win_rate: 0,
          avg_volume: 0,
          total_calls: 0,
          verified: false,
          bot_score: 0,
          specialty: []
        };
      } else {
        // Telegram analysis
        const userInfo = await telegramService.getUserInfo(parseInt(username));
        if (!userInfo.success) {
          throw new Error('Failed to fetch Telegram user info');
        }

        analytics = {
          user_id: username,
          username: username,
          platform: 'telegram',
          followers: 0,
          engagement_rate: 0,
          post_frequency: 0,
          win_rate: 0,
          avg_volume: 0,
          total_calls: 0,
          verified: false,
          bot_score: 0,
          specialty: []
        };
      }

      return {
        success: true,
        data: analytics,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  async analyzeTokenCall(
    tokenAddress: string, 
    callTimestamp: number, 
    kolId: string,
    chain: string = 'ethereum'
  ): Promise<APIResponse<CallAnalysis>> {
    try {
      // Get token data
      const tokenData = await blockchainService.getTokenData(tokenAddress, chain);
      if (!tokenData.success) {
        throw new Error('Failed to fetch token data');
      }

      // Analyze volume spike
      const volumeAnalysis = await blockchainService.analyzeVolumeSpike(tokenAddress, callTimestamp, chain);
      if (!volumeAnalysis.success) {
        throw new Error('Failed to analyze volume');
      }

      // Get price data
      const priceData = await marketDataService.getTokenPrice(tokenAddress, chain);
      
      const analysis: CallAnalysis = {
        id: `${kolId}_${tokenAddress}_${callTimestamp}`,
        kol_id: kolId,
        token_address: tokenAddress,
        token_symbol: tokenData.data?.symbol || 'UNKNOWN',
        call_timestamp: callTimestamp,
        volume_before: {
          timestamp: callTimestamp - 600,
          volume_1m: 0,
          volume_5m: 0,
          volume_10m: 0,
          price_change_1m: 0,
          price_change_5m: 0,
          price_change_10m: 0,
        },
        volume_after: volumeAnalysis.data || {
          timestamp: callTimestamp,
          volume_1m: 0,
          volume_5m: 0,
          volume_10m: 0,
          price_change_1m: 0,
          price_change_5m: 0,
          price_change_10m: 0,
        },
        price_impact: 0,
        success: false,
        confidence_score: 0,
      };

      // Calculate success metrics
      if (volumeAnalysis.data) {
        const volumeIncrease = volumeAnalysis.data.volume_5m > 0;
        analysis.success = volumeIncrease;
        analysis.confidence_score = volumeIncrease ? 0.8 : 0.2;
      }

      return {
        success: true,
        data: analysis,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  // Subscribe to real-time events
  subscribeToVolumeSpikes(callback: (data: any) => void): void {
    websocketService.subscribe('volume_spike', callback);
  }

  subscribeToNewCalls(callback: (data: any) => void): void {
    websocketService.subscribe('new_call', callback);
  }

  subscribeToBotDetection(callback: (data: any) => void): void {
    websocketService.subscribe('bot_detected', callback);
  }
}

export const kolTrackerAPI = new KOLTrackerAPI();

// Export individual services
export { leaderboardService } from './leaderboardService';
export { botDetectionService } from './botDetectionService';