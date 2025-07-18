import { IS_DEMO_MODE } from '../config/api';

// Demo/Mock data for when backend is not available
interface MockKOL {
  _id: string;
  displayName: string;
  telegramUsername: string;
  description: string;
  tags: string[];
  stats: {
    totalPosts: number;
    totalViews: number;
    totalForwards: number;
  };
  discoveredFrom?: string;
}

interface MockBotDetectionResult {
  username: string;
  isBot: boolean;
  confidence: number;
  analysis: {
    account_age: number;
    message_frequency: number;
    content_pattern_score: number;
    follower_ratio: number;
    profile_completeness: number;
  };
  recommendations: string[];
}

class DemoService {
  private mockKOLs: MockKOL[] = [
    {
      _id: 'demo_kol_1',
      displayName: 'CryptoKing',
      telegramUsername: 'cryptoking_official',
      description: 'Leading crypto analyst with 95% win rate on DeFi calls',
      tags: ['DeFi', 'Analytics', 'Trading'],
      stats: {
        totalPosts: 847,
        totalViews: 2847502,
        totalForwards: 18294
      },
      discoveredFrom: 'Demo'
    },
    {
      _id: 'demo_kol_2',
      displayName: 'DeFi Master',
      telegramUsername: 'defi_master_pro',
      description: 'Specialized in yield farming and liquidity strategies',
      tags: ['DeFi', 'Yield Farming', 'Strategy'],
      stats: {
        totalPosts: 623,
        totalViews: 1847293,
        totalForwards: 12847
      },
      discoveredFrom: 'Demo'
    },
    {
      _id: 'demo_kol_3',
      displayName: 'NFT Hunter',
      telegramUsername: 'nft_hunter_alpha',
      description: 'Early NFT trends and alpha calls',
      tags: ['NFT', 'Alpha', 'Trends'],
      stats: {
        totalPosts: 392,
        totalViews: 947582,
        totalForwards: 7293
      },
      discoveredFrom: 'Demo'
    }
  ];

  getMockKOLs(): MockKOL[] {
    return this.mockKOLs;
  }

  createMockKOL(kolData: Partial<MockKOL>): MockKOL {
    const newKOL: MockKOL = {
      _id: `demo_kol_${Date.now()}`,
      displayName: kolData.displayName || 'Demo KOL',
      telegramUsername: kolData.telegramUsername || 'demo_user',
      description: kolData.description || 'Demo KOL for testing purposes',
      tags: kolData.tags || ['Demo'],
      stats: {
        totalPosts: Math.floor(Math.random() * 1000),
        totalViews: Math.floor(Math.random() * 1000000),
        totalForwards: Math.floor(Math.random() * 50000)
      },
      discoveredFrom: 'Demo'
    };

    this.mockKOLs.push(newKOL);
    return newKOL;
  }

  getMockBotDetection(username: string): MockBotDetectionResult {
    const isBot = Math.random() > 0.7; // 30% chance of being a bot
    const confidence = Math.random() * 0.3 + (isBot ? 0.7 : 0.2);

    return {
      username: username.replace('@', ''),
      isBot,
      confidence,
      analysis: {
        account_age: Math.floor(Math.random() * 1000) + 30,
        message_frequency: Math.random() * 10,
        content_pattern_score: Math.random(),
        follower_ratio: Math.random(),
        profile_completeness: Math.random()
      },
      recommendations: isBot 
        ? ['Account shows bot-like behavior', 'Consider manual verification', 'Monitor for spam patterns']
        : ['Account appears legitimate', 'Good engagement patterns', 'Regular posting schedule']
    };
  }

  getMockChannelScan(username: string) {
    return {
      channel: username.replace('@', ''),
      totalMembers: Math.floor(Math.random() * 100000) + 1000,
      activeMembers: Math.floor(Math.random() * 10000) + 100,
      posts: Array.from({ length: 10 }, (_, i) => ({
        id: `demo_post_${i}`,
        text: `Demo post ${i + 1} - This is a sample crypto analysis post with market insights and trading signals.`,
        date: new Date(Date.now() - i * 3600000).toISOString(),
        views: Math.floor(Math.random() * 10000),
        forwards: Math.floor(Math.random() * 1000)
      })),
      analysis: {
        avgEngagement: Math.random() * 0.1,
        topHashtags: ['#crypto', '#defi', '#trading', '#bitcoin', '#ethereum'],
        posting_frequency: 'Daily',
        risk_level: 'Low'
      }
    };
  }

  getMockMarketData(tokenAddress: string) {
    return {
      success: true,
      data: {
        price_usd: Math.random() * 100,
        price_change_24h: (Math.random() - 0.5) * 20,
        volume_24h: Math.random() * 1000000,
        market_cap: Math.random() * 10000000,
        last_updated: Date.now()
      },
      timestamp: Date.now()
    };
  }

  getMockGameData() {
    return {
      activeGames: [
        {
          id: 'demo_game_1',
          type: 'coinflip',
          status: 'waiting',
          betAmount: 0.1,
          currency: 'SOL',
          players: 1,
          maxPlayers: 2
        }
      ],
      leaderboard: [
        { username: 'CryptoKing', wins: 47, losses: 12, winRate: 79.7 },
        { username: 'DeFiMaster', wins: 32, losses: 15, winRate: 68.1 },
        { username: 'NFTHunter', wins: 28, losses: 18, winRate: 60.9 }
      ]
    };
  }

  // Helper method to simulate API delays
  async simulateDelay(ms: number = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Wrapper methods that add realistic delays
  async getKOLsAsync(): Promise<MockKOL[]> {
    await this.simulateDelay(800);
    return this.getMockKOLs();
  }

  async createKOLAsync(kolData: Partial<MockKOL>): Promise<MockKOL> {
    await this.simulateDelay(1200);
    return this.createMockKOL(kolData);
  }

  async analyzeBotAsync(username: string): Promise<MockBotDetectionResult> {
    await this.simulateDelay(2000);
    return this.getMockBotDetection(username);
  }

  async scanChannelAsync(username: string) {
    await this.simulateDelay(3000);
    return this.getMockChannelScan(username);
  }

  async getMarketDataAsync(tokenAddress: string) {
    await this.simulateDelay(500);
    return this.getMockMarketData(tokenAddress);
  }
}

export const demoService = new DemoService();

// Export helper to check if we should use demo data
export const shouldUseDemoData = () => IS_DEMO_MODE; 