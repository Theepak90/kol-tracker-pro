import { API_BASE_URL } from '../config/api';

export interface LeaderboardKOL {
  id: string;
  displayName: string;
  telegramUsername: string;
  avatar?: string;
  description?: string;
  tags: string[];
  specialty: string[];
  verified: boolean;
  
  // Ranking Metrics
  overallScore: number;
  
  // Performance Metrics
  tradingPerformance: {
    winRate: number; // 0-100
    totalCalls: number;
    successfulCalls: number;
    avgVolume: number;
    totalVolume: number;
    bestCall: {
      token: string;
      gain: number;
      date: string;
    };
    recentPerformance: number; // 0-100 (last 30 days)
  };
  
  // Influence Metrics
  influenceMetrics: {
    followers: number;
    avgViews: number;
    avgForwards: number;
    engagementRate: number; // 0-100
    viralPotential: number; // 0-100
    credibilityScore: number; // 0-100
    marketImpact: 'high' | 'medium' | 'low';
  };
  
  // Activity Metrics
  activityMetrics: {
    postsLast30Days: number;
    avgPostsPerDay: number;
    lastActive: string;
    consistency: number; // 0-100
    responseTime: number; // hours
  };
  
  // Risk Assessment
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high';
    riskScore: number; // 0-100
    riskFactors: string[];
    reliability: number; // 0-100
  };
  
  // Rankings
  rankings: {
    overall: number;
    trading: number;
    influence: number;
    engagement: number;
    consistency: number;
  };
  
  // Trend Data
  trends: {
    scoreChange: number; // +/- from last week
    rankChange: number; // +/- positions
    trend: 'up' | 'down' | 'stable';
  };
  
  // Additional Info
  joinedDate: string;
  lastUpdated: string;
  tier: 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze';
}

export interface LeaderboardStats {
  totalKOLs: number;
  avgWinRate: number;
  avgVolume: number;
  avgScore: number;
  avgEngagement: number;
  topPerformer: string;
  biggestGainer: string;
  mostConsistent: string;
}

class LeaderboardService {
  private kols: LeaderboardKOL[] = [];
  private lastUpdated: Date = new Date();

  constructor() {
    // Remove mock data generation - service will fetch real data only
  }

  async getLeaderboard(timeframe: string = '7d'): Promise<LeaderboardKOL[]> {
    try {
      // Fetch real data from backend API
      const response = await fetch(`${API_BASE_URL}/api/leaderboard?timeframe=${timeframe}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard data: ${response.status}`);
      }

      const data = await response.json();
      this.kols = data.kols || [];
      this.lastUpdated = new Date();
      
      return this.kols;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw new Error(`Failed to load leaderboard data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getKOLByRank(rank: number): Promise<LeaderboardKOL | null> {
    if (this.kols.length === 0) {
      await this.getLeaderboard();
    }
    
    const kol = this.kols.find(k => k.rankings.overall === rank);
    return kol || null;
  }

  async getKOLById(id: string): Promise<LeaderboardKOL | null> {
    if (this.kols.length === 0) {
      await this.getLeaderboard();
    }
    
    const kol = this.kols.find(k => k.id === id);
    return kol || null;
  }

  async getTopPerformers(count: number = 10, category?: string): Promise<LeaderboardKOL[]> {
    if (this.kols.length === 0) {
      await this.getLeaderboard();
    }

    let filtered = this.kols;
    
    if (category) {
      filtered = this.kols.filter(kol => 
        kol.specialty.some(spec => spec.toLowerCase().includes(category.toLowerCase()))
      );
    }

    return filtered
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, count);
  }

  getLastUpdated(): Date {
    return this.lastUpdated;
  }

  async refreshData(): Promise<void> {
    await this.getLeaderboard();
  }
}

export const leaderboardService = new LeaderboardService(); 