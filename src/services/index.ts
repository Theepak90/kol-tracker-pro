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

// Utility function to extract username from URL
function extractUsernameFromURL(url: string): string | null {
  // Handle various Telegram URL formats
  const patterns = [
    /t\.me\/([a-zA-Z0-9_]+)/,
    /telegram\.me\/([a-zA-Z0-9_]+)/,
    /([a-zA-Z0-9_]+)/ // Direct username
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

class KOLTrackerAPI {
  constructor() {
    // Only initialize WebSocket connection in development
    if (process.env.NODE_ENV !== 'production') {
      websocketService.connect();
    } else {
      console.log('🔇 WebSocket connections disabled in production');
    }
  }

  async analyzeChannel(channelURL: string): Promise<APIResponse<{
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

      const username = extractUsernameFromURL(channelURL);
      
      if (!username) {
        throw new Error('Invalid channel URL');
      }

      // Mock channel analysis for now - replace with real implementation when methods exist
      const channelInfo = {
        success: true,
        data: {
          title: `Channel ${username}`,
          description: `Analysis for ${username}`,
          member_count: Math.floor(Math.random() * 10000) + 100
        }
      };

      const memberCount = {
        success: true,
        data: Math.floor(Math.random() * 10000) + 100
      };

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
        // Mock Telegram analysis for now
        analytics = {
          user_id: username,
          username: username,
          platform: 'telegram',
          followers: Math.floor(Math.random() * 10000) + 100,
          engagement_rate: Math.random() * 10,
          post_frequency: Math.random() * 5,
          win_rate: Math.random() * 100,
          avg_volume: Math.random() * 1000000,
          total_calls: Math.floor(Math.random() * 100),
          verified: Math.random() > 0.5,
          bot_score: Math.random() * 100,
          specialty: ['DeFi', 'NFT', 'Trading'].filter(() => Math.random() > 0.5)
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

  // Subscribe to real-time events - Mock implementations for production
  subscribeToVolumeSpikes(callback: (data: any) => void): void {
    if (process.env.NODE_ENV !== 'production' && websocketService.isConnected()) {
      // websocketService.subscribe('volume_spike', callback);
      console.log('WebSocket subscriptions not implemented yet');
    }
  }

  subscribeToNewCalls(callback: (data: any) => void): void {
    if (process.env.NODE_ENV !== 'production' && websocketService.isConnected()) {
      // websocketService.subscribe('new_call', callback);
      console.log('WebSocket subscriptions not implemented yet');
    }
  }

  subscribeToBotDetection(callback: (data: any) => void): void {
    if (process.env.NODE_ENV !== 'production' && websocketService.isConnected()) {
      // websocketService.subscribe('bot_detected', callback);
      console.log('WebSocket subscriptions not implemented yet');
    }
  }
}

export const kolTrackerAPI = new KOLTrackerAPI();

// Export individual services
export { leaderboardService } from './leaderboardService';
export { botDetectionService } from './botDetectionService';