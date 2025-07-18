import { io, Socket } from 'socket.io-client';
import { authService } from './authService';
import { blockchainService } from './blockchainService';
import { WS_URL } from '../config/api';

export interface GameRoom {
  id: string;
  gameType: 'coinflip' | 'jackpot' | 'kol_predictor' | 'market_master';
  status: 'waiting' | 'playing' | 'completed';
  players: Player[];
  betAmount: number;
  currency: 'SOL' | 'USDT';
  createdAt: Date;
  winner?: Player;
}

export interface Player {
  id: string;
  username: string;
  avatar?: string;
  walletAddress: string;
}

class GameService {
  private socket: Socket | null = null;
  private activeGames: Map<string, GameRoom> = new Map();
  private platformWallet = 'platform_wallet_address'; // Mock platform wallet

  constructor() {
    // Only initialize socket in development
    if (process.env.NODE_ENV !== 'production') {
      this.initializeSocket();
    } else {
      console.log('🔇 Game service disabled in production');
    }
  }

  private initializeSocket() {
    // Skip if in production
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    try {
      this.socket = io(`${WS_URL}/games`, {
        auth: {
          token: authService.getToken()
        }
      });

      this.socket.on('connect', () => {
        console.log('Connected to game server');
      });

      this.socket.on('gameCreated', (game: GameRoom) => {
        this.activeGames.set(game.id, game);
      });

      this.socket.on('gameJoined', (game: GameRoom) => {
        this.activeGames.set(game.id, game);
      });

      this.socket.on('gameStarted', (game: GameRoom) => {
        this.activeGames.set(game.id, game);
      });

      this.socket.on('gameCompleted', async (game: GameRoom) => {
        this.activeGames.set(game.id, game);
        if (game.winner) {
          // Handle payout
          await this.handlePayout(game);
        }
      });
    } catch (error) {
      console.warn('🔇 Game service WebSocket connection failed');
    }
  }

  private async handlePayout(game: GameRoom) {
    const { winner, betAmount, currency } = game;
    
    if (!winner) {
      console.error('No winner found for game payout');
      return;
    }
    
    const platformFee = betAmount * 0.2; // 20% platform fee
    const winnerAmount = betAmount * 1.8; // 1.8x payout for winner

    try {
      // Transfer winner amount
      await blockchainService.transfer({
        to: winner.walletAddress,
        amount: winnerAmount,
        currency: currency
      });

      // Transfer platform fee to platform wallet
      await blockchainService.transfer({
        to: this.platformWallet,
        amount: platformFee,
        currency: currency
      });
    } catch (error) {
      console.error('Failed to process payout:', error);
      // Implement retry mechanism or alert admin
    }
  }

  // Coinflip Game Methods
  async createCoinflipGame(betAmount: number, currency: 'SOL' | 'USDT'): Promise<GameRoom> {
    if (!this.socket) throw new Error('Not connected to game server');

    return new Promise((resolve) => {
      this.socket!.emit('createGame', {
        gameType: 'coinflip',
        betAmount,
        currency
      }, (game: GameRoom) => {
        this.activeGames.set(game.id, game);
        resolve(game);
      });
    });
  }

  async joinCoinflipGame(gameId: string): Promise<GameRoom> {
    if (!this.socket) throw new Error('Not connected to game server');

    return new Promise((resolve) => {
      this.socket!.emit('joinGame', { gameId }, (game: GameRoom) => {
        this.activeGames.set(game.id, game);
        resolve(game);
      });
    });
  }

  // Jackpot Game Methods
  async createJackpotGame(betAmount: number, currency: 'SOL' | 'USDT'): Promise<GameRoom> {
    if (!this.socket) throw new Error('Not connected to game server');

    return new Promise((resolve) => {
      this.socket!.emit('createGame', {
        gameType: 'jackpot',
        betAmount,
        currency
      }, (game: GameRoom) => {
        this.activeGames.set(game.id, game);
        resolve(game);
      });
    });
  }

  async joinJackpotGame(gameId: string): Promise<GameRoom> {
    if (!this.socket) throw new Error('Not connected to game server');

    return new Promise((resolve) => {
      this.socket!.emit('joinGame', { gameId }, (game: GameRoom) => {
        this.activeGames.set(game.id, game);
        resolve(game);
      });
    });
  }

  // KOL Predictor Game Methods
  async createKOLPredictorGame(betAmount: number, currency: 'SOL' | 'USDT'): Promise<GameRoom> {
    if (!this.socket) throw new Error('Not connected to game server');

    return new Promise((resolve) => {
      this.socket!.emit('createGame', {
        gameType: 'kol_predictor',
        betAmount,
        currency
      }, (game: GameRoom) => {
        this.activeGames.set(game.id, game);
        resolve(game);
      });
    });
  }

  // Market Master Game Methods
  async createMarketMasterGame(betAmount: number, currency: 'SOL' | 'USDT'): Promise<GameRoom> {
    if (!this.socket) throw new Error('Not connected to game server');

    return new Promise((resolve) => {
      this.socket!.emit('createGame', {
        gameType: 'market_master',
        betAmount,
        currency
      }, (game: GameRoom) => {
        this.activeGames.set(game.id, game);
        resolve(game);
      });
    });
  }

  // Utility Methods
  getActiveGames(): GameRoom[] {
    return Array.from(this.activeGames.values());
  }

  getGameById(gameId: string): GameRoom | undefined {
    return this.activeGames.get(gameId);
  }

  subscribeToGame(gameId: string, callback: (game: GameRoom) => void) {
    if (!this.socket) throw new Error('Not connected to game server');
    this.socket.on(`gameUpdate:${gameId}`, callback);
  }

  unsubscribeFromGame(gameId: string) {
    if (!this.socket) return;
    this.socket.off(`gameUpdate:${gameId}`);
  }
}

export const gameService = new GameService(); 