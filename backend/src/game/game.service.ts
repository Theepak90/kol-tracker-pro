import { Injectable } from '@nestjs/common';

export interface Player {
  id: string;
  username: string;
  avatar?: string;
  walletAddress: string;
}

export interface Game {
  id: string;
  gameType: 'coinflip' | 'jackpot' | 'kol_predictor' | 'market_master';
  status: 'waiting' | 'playing' | 'completed';
  players: Player[];
  betAmount: number;
  currency: 'SOL' | 'USDT';
  createdAt: Date;
  winner?: Player;
}

@Injectable()
export class GameService {
  private games: Map<string, Game> = new Map();

  async create(gameData: Partial<Game>): Promise<Game> {
    const game: Game = {
      id: gameData.id || Date.now().toString(),
      gameType: gameData.gameType || 'coinflip',
      status: gameData.status || 'waiting',
      players: gameData.players || [],
      betAmount: gameData.betAmount || 0,
      currency: gameData.currency || 'SOL',
      createdAt: gameData.createdAt || new Date(),
      winner: gameData.winner
    };

    this.games.set(game.id, game);
    return game;
  }

  async findById(id: string): Promise<Game | null> {
    return this.games.get(id) || null;
  }

  async findActiveGames(): Promise<Game[]> {
    return Array.from(this.games.values())
      .filter(game => game.status === 'waiting')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateGame(id: string, update: Partial<Game>): Promise<Game | null> {
    const existingGame = this.games.get(id);
    if (!existingGame) return null;

    const updatedGame = { ...existingGame, ...update };
    this.games.set(id, updatedGame);
    return updatedGame;
  }

  async deleteGame(id: string): Promise<void> {
    this.games.delete(id);
  }
} 