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
    this.generateMockKOLs();
  }

  private generateMockKOLs(): void {
    const kolNames = [
      'CryptoKing', 'DeFiWhale', 'MemeGod', 'AltcoinAlpha', 'ChainAnalyst',
      'TokenTitan', 'CryptoSage', 'BlockchainBull', 'DeFiDegen', 'NFTNinja',
      'YieldFarmer', 'LiquidityLord', 'SmartMoney', 'CryptoOracle', 'TradingPro',
      'MetaverseMaster', 'Layer2Lord', 'StakingKing', 'BridgeBoss', 'FlashLoan',
      'ArbitrageAce', 'MEVMaster', 'GasOptimizer', 'ProtocolPro', 'DeFiDetective'
    ];

    const specialties = [
      'DeFi', 'Memecoins', 'Layer 2', 'NFTs', 'Altcoins', 'Trading', 'Analytics',
      'Yield Farming', 'Staking', 'Governance', 'MEV', 'Arbitrage', 'Options'
    ];

    const descriptions = [
      'Professional crypto trader with 5+ years experience',
      'DeFi protocol analyst and yield farming expert',
      'Memecoin specialist with insider connections',
      'Layer 2 scaling solutions researcher',
      'NFT market analyst and collector',
      'Technical analysis expert and swing trader',
      'On-chain data analyst and researcher',
      'Yield farming strategist and LP provider',
      'Governance token specialist',
      'MEV and arbitrage opportunity hunter'
    ];

    this.kols = kolNames.map((name, index) => {
      const winRate = 45 + Math.random() * 40; // 45-85%
      const totalCalls = 50 + Math.floor(Math.random() * 200); // 50-250 calls
      const successfulCalls = Math.floor(totalCalls * (winRate / 100));
      const avgVolume = 50000 + Math.random() * 500000; // $50K-$550K
      const totalVolume = avgVolume * totalCalls;
      const followers = 1000 + Math.floor(Math.random() * 50000); // 1K-51K
      const engagementRate = 2 + Math.random() * 8; // 2-10%
      const credibilityScore = 60 + Math.random() * 40; // 60-100
      const consistency = 50 + Math.random() * 50; // 50-100
      
      // Calculate overall score (weighted average)
      const overallScore = Math.round(
        (winRate * 0.3) + 
        (engagementRate * 5 * 0.2) + 
        (credibilityScore * 0.2) + 
        (consistency * 0.15) + 
        (Math.min(totalVolume / 10000000, 1) * 100 * 0.15)
      );

      const kol: LeaderboardKOL = {
        id: `kol_${index + 1}`,
        displayName: name,
        telegramUsername: name.toLowerCase().replace(/\s+/g, '_'),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        tags: this.getRandomTags(),
        specialty: this.getRandomSpecialties(specialties),
        verified: Math.random() > 0.7,
        overallScore,
        
        tradingPerformance: {
          winRate: Math.round(winRate * 10) / 10,
          totalCalls,
          successfulCalls,
          avgVolume: Math.round(avgVolume),
          totalVolume: Math.round(totalVolume),
          bestCall: {
            token: this.getRandomToken(),
            gain: Math.round((200 + Math.random() * 800) * 10) / 10, // 200-1000%
            date: this.getRandomDate()
          },
          recentPerformance: Math.round((40 + Math.random() * 50) * 10) / 10 // 40-90%
        },
        
        influenceMetrics: {
          followers,
          avgViews: Math.round(followers * (0.1 + Math.random() * 0.4)), // 10-50% of followers
          avgForwards: Math.round(followers * (0.02 + Math.random() * 0.08)), // 2-10% of followers
          engagementRate: Math.round(engagementRate * 10) / 10,
          viralPotential: Math.round((30 + Math.random() * 70) * 10) / 10,
          credibilityScore: Math.round(credibilityScore * 10) / 10,
          marketImpact: this.getMarketImpact(followers, engagementRate)
        },
        
        activityMetrics: {
          postsLast30Days: 15 + Math.floor(Math.random() * 45), // 15-60 posts
          avgPostsPerDay: Math.round((0.5 + Math.random() * 2) * 10) / 10, // 0.5-2.5 posts/day
          lastActive: this.getRecentDate(),
          consistency: Math.round(consistency * 10) / 10,
          responseTime: Math.round((0.5 + Math.random() * 4) * 10) / 10 // 0.5-4.5 hours
        },
        
        riskAssessment: {
          overallRisk: this.getRiskLevel(winRate, consistency),
          riskScore: Math.round((100 - ((winRate + consistency) / 2)) * 10) / 10,
          riskFactors: this.getRiskFactors(),
          reliability: Math.round(((winRate + consistency) / 2) * 10) / 10
        },
        
        rankings: {
          overall: 0, // Will be set after sorting
          trading: 0,
          influence: 0,
          engagement: 0,
          consistency: 0
        },
        
        trends: {
          scoreChange: Math.round((Math.random() - 0.5) * 20 * 10) / 10, // -10 to +10
          rankChange: Math.floor((Math.random() - 0.5) * 10), // -5 to +5
          trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable'
        },
        
        joinedDate: this.getJoinDate(),
        lastUpdated: new Date().toISOString(),
        tier: this.getTier(overallScore)
      };

      return kol;
    });

    // Sort by overall score and assign rankings
    this.assignRankings();
  }

  private assignRankings(): void {
    // Overall ranking
    this.kols.sort((a, b) => b.overallScore - a.overallScore);
    this.kols.forEach((kol, index) => {
      kol.rankings.overall = index + 1;
    });

    // Trading ranking
    const tradingSorted = [...this.kols].sort((a, b) => b.tradingPerformance.winRate - a.tradingPerformance.winRate);
    tradingSorted.forEach((kol, index) => {
      kol.rankings.trading = index + 1;
    });

    // Influence ranking
    const influenceSorted = [...this.kols].sort((a, b) => b.influenceMetrics.followers - a.influenceMetrics.followers);
    influenceSorted.forEach((kol, index) => {
      kol.rankings.influence = index + 1;
    });

    // Engagement ranking
    const engagementSorted = [...this.kols].sort((a, b) => b.influenceMetrics.engagementRate - a.influenceMetrics.engagementRate);
    engagementSorted.forEach((kol, index) => {
      kol.rankings.engagement = index + 1;
    });

    // Consistency ranking
    const consistencySorted = [...this.kols].sort((a, b) => b.activityMetrics.consistency - a.activityMetrics.consistency);
    consistencySorted.forEach((kol, index) => {
      kol.rankings.consistency = index + 1;
    });
  }

  private getRandomTags(): string[] {
    const allTags = ['Verified', 'Top Performer', 'Rising Star', 'Consistent', 'High Volume', 'Expert', 'Influencer'];
    const numTags = 1 + Math.floor(Math.random() * 3);
    return allTags.sort(() => Math.random() - 0.5).slice(0, numTags);
  }

  private getRandomSpecialties(specialties: string[]): string[] {
    const numSpecialties = 1 + Math.floor(Math.random() * 3);
    return specialties.sort(() => Math.random() - 0.5).slice(0, numSpecialties);
  }

  private getRandomToken(): string {
    const tokens = ['PEPE', 'SHIB', 'DOGE', 'FLOKI', 'BONK', 'WIF', 'POPCAT', 'BRETT', 'MOG', 'TURBO'];
    return tokens[Math.floor(Math.random() * tokens.length)];
  }

  private getRandomDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    return date.toISOString().split('T')[0];
  }

  private getRecentDate(): string {
    const date = new Date();
    date.setHours(date.getHours() - Math.floor(Math.random() * 24));
    return date.toISOString();
  }

  private getJoinDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 365));
    return date.toISOString().split('T')[0];
  }

  private getMarketImpact(followers: number, engagementRate: number): 'high' | 'medium' | 'low' {
    const impact = followers * (engagementRate / 100);
    if (impact > 2000) return 'high';
    if (impact > 500) return 'medium';
    return 'low';
  }

  private getRiskLevel(winRate: number, consistency: number): 'low' | 'medium' | 'high' {
    const avg = (winRate + consistency) / 2;
    if (avg > 75) return 'low';
    if (avg > 60) return 'medium';
    return 'high';
  }

  private getRiskFactors(): string[] {
    const factors = [
      'High volatility in performance',
      'Limited track record',
      'Inconsistent posting schedule',
      'Low engagement rates',
      'Unverified claims',
      'Market manipulation concerns'
    ];
    const numFactors = Math.floor(Math.random() * 3);
    return factors.sort(() => Math.random() - 0.5).slice(0, numFactors);
  }

  private getTier(score: number): 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze' {
    if (score >= 85) return 'diamond';
    if (score >= 75) return 'platinum';
    if (score >= 65) return 'gold';
    if (score >= 55) return 'silver';
    return 'bronze';
  }

  // Public methods
  getLeaderboard(sortBy: 'score' | 'volume' | 'followers' | 'engagement' = 'score', filterSpecialty: string = 'all'): LeaderboardKOL[] {
    let filtered = this.kols;

    // Apply specialty filter
    if (filterSpecialty !== 'all') {
      filtered = this.kols.filter(kol => 
        kol.specialty.some(spec => spec.toLowerCase() === filterSpecialty.toLowerCase())
      );
    }

    // Sort by selected criteria
    switch (sortBy) {
      case 'volume':
        return [...filtered].sort((a, b) => b.tradingPerformance.totalVolume - a.tradingPerformance.totalVolume);
      case 'followers':
        return [...filtered].sort((a, b) => b.influenceMetrics.followers - a.influenceMetrics.followers);
      case 'engagement':
        return [...filtered].sort((a, b) => b.influenceMetrics.engagementRate - a.influenceMetrics.engagementRate);
      case 'score':
      default:
        return [...filtered].sort((a, b) => b.overallScore - a.overallScore);
    }
  }

  getStats(): LeaderboardStats {
    if (this.kols.length === 0) {
      return {
        totalKOLs: 0,
        avgWinRate: 0,
        avgVolume: 0,
        avgScore: 0,
        avgEngagement: 0,
        topPerformer: '',
        biggestGainer: '',
        mostConsistent: ''
      };
    }

    const totalWinRate = this.kols.reduce((sum, kol) => sum + kol.tradingPerformance.winRate, 0);
    const totalVolume = this.kols.reduce((sum, kol) => sum + kol.tradingPerformance.totalVolume, 0);
    const totalScore = this.kols.reduce((sum, kol) => sum + kol.overallScore, 0);
    const totalEngagement = this.kols.reduce((sum, kol) => sum + kol.influenceMetrics.engagementRate, 0);

    const topPerformer = this.kols.reduce((top, kol) => 
      kol.overallScore > top.overallScore ? kol : top
    );

    const biggestGainer = this.kols.reduce((top, kol) => 
      kol.trends.scoreChange > top.trends.scoreChange ? kol : top
    );

    const mostConsistent = this.kols.reduce((top, kol) => 
      kol.activityMetrics.consistency > top.activityMetrics.consistency ? kol : top
    );

    return {
      totalKOLs: this.kols.length,
      avgWinRate: Math.round((totalWinRate / this.kols.length) * 10) / 10,
      avgVolume: Math.round(totalVolume / this.kols.length),
      avgScore: Math.round((totalScore / this.kols.length) * 10) / 10,
      avgEngagement: Math.round((totalEngagement / this.kols.length) * 10) / 10,
      topPerformer: topPerformer.displayName,
      biggestGainer: biggestGainer.displayName,
      mostConsistent: mostConsistent.displayName
    };
  }

  getTopPerformers(limit: number = 10): LeaderboardKOL[] {
    return this.kols.slice(0, limit);
  }

  getKOLById(id: string): LeaderboardKOL | undefined {
    return this.kols.find(kol => kol.id === id);
  }

  refreshData(): void {
    this.generateMockKOLs();
    this.lastUpdated = new Date();
  }

  getLastUpdated(): Date {
    return this.lastUpdated;
  }
}

export const leaderboardService = new LeaderboardService(); 