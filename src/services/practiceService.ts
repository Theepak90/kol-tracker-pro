interface PracticeBalance {
  solBalance: number;
  usdtBalance: number;
  lastUpdated: number;
}

interface PracticeGameResult {
  winner: 'user' | 'computer';
  userPayout: number;
  gameDetails: any;
  newBalance: number;
}

class PracticeService {
  private readonly STORAGE_KEY = 'kol_practice_balance';
  private readonly INITIAL_SOL_BALANCE = 100; // Start with 100 SOL for practice
  private readonly INITIAL_USDT_BALANCE = 10000; // Start with 10,000 USDT for practice
  private readonly REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.initializePracticeBalance();
  }

  private initializePracticeBalance(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      this.resetBalance();
    }
  }

  getPracticeBalance(): PracticeBalance {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const balance = JSON.parse(stored);
        // Check if balance needs refresh (24 hours old)
        if (Date.now() - balance.lastUpdated > this.REFRESH_INTERVAL) {
          this.resetBalance();
          return this.getPracticeBalance();
        }
        return balance;
      } catch (error) {
        console.error('Error parsing practice balance:', error);
        this.resetBalance();
        return this.getPracticeBalance();
      }
    }
    this.resetBalance();
    return this.getPracticeBalance();
  }

  getSOLBalance(): number {
    return this.getPracticeBalance().solBalance;
  }

  getUSDTBalance(): number {
    return this.getPracticeBalance().usdtBalance;
  }

  canAffordBet(amount: number, currency: 'SOL' | 'USDT'): boolean {
    const balance = this.getPracticeBalance();
    return currency === 'SOL' ? 
      balance.solBalance >= amount : 
      balance.usdtBalance >= amount;
  }

  deductBalance(amount: number, currency: 'SOL' | 'USDT'): boolean {
    if (!this.canAffordBet(amount, currency)) {
      return false;
    }

    const balance = this.getPracticeBalance();
    if (currency === 'SOL') {
      balance.solBalance -= amount;
    } else {
      balance.usdtBalance -= amount;
    }
    balance.lastUpdated = Date.now();
    
    this.saveBalance(balance);
    return true;
  }

  addBalance(amount: number, currency: 'SOL' | 'USDT'): void {
    const balance = this.getPracticeBalance();
    if (currency === 'SOL') {
      balance.solBalance += amount;
    } else {
      balance.usdtBalance += amount;
    }
    balance.lastUpdated = Date.now();
    
    this.saveBalance(balance);
  }

  resetBalance(): void {
    const balance: PracticeBalance = {
      solBalance: this.INITIAL_SOL_BALANCE,
      usdtBalance: this.INITIAL_USDT_BALANCE,
      lastUpdated: Date.now()
    };
    this.saveBalance(balance);
  }

  private saveBalance(balance: PracticeBalance): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(balance));
  }

  // Simulate game outcomes with realistic win rates (not 98% computer win like real games)
  simulatePracticeGameOutcome(gameType: string, betAmount: number, currency: 'SOL' | 'USDT' = 'SOL'): PracticeGameResult | null {
    if (!this.canAffordBet(betAmount, currency)) {
      return null;
    }

    // Practice mode now guarantees a 100% win rate for the user
    const userWins = true;
    
    // Deduct bet amount
    this.deductBalance(betAmount, currency);
    
    let userPayout = 0;
    if (userWins) {
      userPayout = this.calculatePayout(gameType, betAmount);
      this.addBalance(userPayout, currency);
    }

    const gameDetails = this.generateGameDetails(gameType, userWins);
    const newBalance = currency === 'SOL' ? this.getSOLBalance() : this.getUSDTBalance();

    return {
      winner: userWins ? 'user' : 'computer',
      userPayout,
      gameDetails,
      newBalance
    };
  }

  private calculatePayout(gameType: string, betAmount: number): number {
    const multipliers = {
      coinflip: 1.9,        // 1.9x on win
      jackpot: 2.5,         // 2.5x on win
      kol_predictor: 3.0,   // 3x on win
      market_master: 2.8    // 2.8x on win
    };

    const multiplier = multipliers[gameType as keyof typeof multipliers] || 2.0;
    return betAmount * multiplier;
  }

  private generateGameDetails(gameType: string, userWins: boolean) {
    switch (gameType) {
      case 'coinflip':
        const userChoice = Math.random() > 0.5 ? 'heads' : 'tails';
        const result = userWins ? userChoice : (userChoice === 'heads' ? 'tails' : 'heads');
        return {
          userChoice,
          result,
          flipAnimation: true
        };
        
      case 'jackpot':
        return {
          totalPlayers: Math.floor(Math.random() * 4) + 3, // 3-6 players
          userPosition: userWins ? 1 : Math.floor(Math.random() * 4) + 2,
          jackpotValue: Math.random() * 50 + 10, // 10-60 SOL jackpot
          otherPlayers: [
            { name: 'CryptoBot1', bet: Math.random() * 5 + 1 },
            { name: 'TraderPro', bet: Math.random() * 10 + 2 },
            { name: 'SolanaKing', bet: Math.random() * 8 + 1.5 }
          ]
        };
        
      case 'kol_predictor':
        const prediction = Math.random() > 0.5 ? 'up' : 'down';
        const actualMovement = userWins ? prediction : (prediction === 'up' ? 'down' : 'up');
        const priceChange = userWins ? 
          `+${(Math.random() * 20 + 5).toFixed(1)}%` : 
          `-${(Math.random() * 15 + 3).toFixed(1)}%`;
        return {
          kolName: this.getRandomKOLName(),
          userPrediction: prediction,
          actualMovement,
          priceChange,
          timeframe: '24h'
        };
        
      case 'market_master':
        const marketPrediction = Math.random() > 0.5 ? 'bullish' : 'bearish';
        const actualOutcome = userWins ? marketPrediction : (marketPrediction === 'bullish' ? 'bearish' : 'bullish');
        const priceMovement = userWins ? 
          `+${(Math.random() * 12 + 2).toFixed(2)}%` : 
          `-${(Math.random() * 8 + 1).toFixed(2)}%`;
        return {
          market: this.getRandomMarket(),
          userPrediction: marketPrediction,
          actualOutcome,
          priceMovement,
          timeframe: '1h'
        };
        
      default:
        return { userWins };
    }
  }

  private getRandomKOLName(): string {
    const kols = [
      'CryptoWhale', 'SolanaGuru', 'DeFiMaster', 'BlockchainPro', 
      'CoinOracle', 'TokenKing', 'ChartWizard', 'TradeLegend'
    ];
    return kols[Math.floor(Math.random() * kols.length)];
  }

  private getRandomMarket(): string {
    const markets = [
      'BTC/USD', 'ETH/USD', 'SOL/USD', 'ADA/USD', 
      'MATIC/USD', 'AVAX/USD', 'DOT/USD', 'LINK/USD'
    ];
    return markets[Math.floor(Math.random() * markets.length)];
  }

  // Get daily bonus for practice mode
  claimDailyBonus(): { claimed: boolean; amount: number; nextClaimTime?: number } {
    const lastClaim = localStorage.getItem('kol_practice_daily_claim');
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (lastClaim) {
      const lastClaimTime = parseInt(lastClaim);
      if (now - lastClaimTime < oneDayMs) {
        return {
          claimed: false,
          amount: 0,
          nextClaimTime: lastClaimTime + oneDayMs
        };
      }
    }

    // Give daily bonus
    const bonusAmount = 10; // 10 SOL daily bonus
    this.addBalance(bonusAmount, 'SOL');
    localStorage.setItem('kol_practice_daily_claim', now.toString());

    return {
      claimed: true,
      amount: bonusAmount
    };
  }

  // Check if daily bonus is available
  isDailyBonusAvailable(): boolean {
    const lastClaim = localStorage.getItem('kol_practice_daily_claim');
    if (!lastClaim) return true;

    const now = Date.now();
    const lastClaimTime = parseInt(lastClaim);
    const oneDayMs = 24 * 60 * 60 * 1000;

    return now - lastClaimTime >= oneDayMs;
  }

  // Get practice mode statistics
  getPracticeStats(): {
    gamesPlayed: number;
    wins: number;
    totalWinnings: number;
    winRate: number;
    favoriteGame: string;
    gameStats: Record<string, { played: number; wins: number; winRate: number }>;
  } {
    const defaultStats = {
      gamesPlayed: 0,
      wins: 0,
      totalWinnings: 0,
      winRate: 0,
      favoriteGame: 'coinflip',
      gameStats: {
        coinflip: { played: 0, wins: 0, winRate: 0 },
        jackpot: { played: 0, wins: 0, winRate: 0 },
        kol_predictor: { played: 0, wins: 0, winRate: 0 },
        market_master: { played: 0, wins: 0, winRate: 0 }
      } as Record<string, { played: number; wins: number; winRate: number }>
    };

    const raw = localStorage.getItem('kol_practice_stats');
    if (!raw) {
      return defaultStats;
    }

    try {
      const parsed = JSON.parse(raw);
      return {
        ...defaultStats,
        ...parsed,
        // Deep merge gameStats to ensure each key exists
        gameStats: {
          ...defaultStats.gameStats,
          ...(parsed.gameStats || {})
        }
      };
    } catch (err) {
      console.error('Failed to parse practice stats, resetting:', err);
      return defaultStats;
    }
  }

  // Ensure gameStats object exists before use in updatePracticeStats
  updatePracticeStats(gameType: string, won: boolean, payout: number): void {
    const stats = this.getPracticeStats();

    // guarantee gameStats exists
    if (!stats.gameStats) {
      stats.gameStats = {} as Record<string, { played: number; wins: number; winRate: number }>;
    }

    // overall stats
    stats.gamesPlayed += 1;
    if (won) {
      stats.wins += 1;
    }

    // update overall win rate
    stats.winRate = stats.gamesPlayed > 0 ? (stats.wins / stats.gamesPlayed) * 100 : 0;

    // total winnings
    if (won) {
      stats.totalWinnings += payout;
    }

    // per-game stats
    if (!stats.gameStats[gameType]) {
      stats.gameStats[gameType] = { played: 0, wins: 0, winRate: 0 };
    }
    const gs = stats.gameStats[gameType];
    gs.played += 1;
    if (won) gs.wins += 1;
    gs.winRate = gs.played > 0 ? (gs.wins / gs.played) * 100 : 0;

    // favorite game simple logic
    stats.favoriteGame = gameType;

    localStorage.setItem('kol_practice_stats', JSON.stringify(stats));
  }
}

export const practiceService = new PracticeService();
export default practiceService; 