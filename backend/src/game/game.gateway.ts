import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { v4 as uuidv4 } from 'uuid';
import { GameService, Game, Player } from './game.service';

@WebSocketGateway({
  namespace: 'games',
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private playerSockets: Map<string, Socket> = new Map();

  constructor(private readonly gameService: GameService) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    console.log('🟢 New client connected:', client.id);
    const userId = client.handshake.auth?.userId || client.id;
    const username = client.handshake.auth?.username || 'Anonymous';
    
    this.playerSockets.set(userId, client);
    client.join(`user:${userId}`);
    client.data = {
      userId,
      username,
      walletAddress: client.handshake.auth?.walletAddress || ''
    };
    
    console.log(`📝 User ${username} (${userId}) connected`);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const userId = client.data?.userId || client.id;
    const username = client.data?.username || 'Anonymous';
    
    this.playerSockets.delete(userId);
    client.leave(`user:${userId}`);
    console.log(`🔴 User ${username} (${userId}) disconnected`);
  }

  @SubscribeMessage('createGame')
  async handleCreateGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameType: Game['gameType']; betAmount: number; currency: 'SOL' | 'USDT' }
  ) {
    const userId = client.data?.userId || client.id;
    const username = client.data?.username || 'Anonymous';
    const walletAddress = client.data?.walletAddress || '';
    
    const gameData: Partial<Game> = {
      id: uuidv4(),
      gameType: data.gameType,
      status: 'waiting',
      players: [{
        id: userId,
        username: username,
        walletAddress: walletAddress
      }],
      betAmount: data.betAmount,
      currency: data.currency,
      createdAt: new Date()
    };

    const game = await this.gameService.create(gameData);
    client.join(`game:${game.id}`);
    this.server.emit('gameCreated', game);
    return game;
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string }
  ) {
    const game = await this.gameService.findById(data.gameId);
    if (!game || game.status !== 'waiting') {
      throw new Error('Game not available');
    }

    const userId = client.data?.userId || client.id;
    const username = client.data?.username || 'Anonymous';
    const walletAddress = client.data?.walletAddress || '';
    
    const player: Player = {
      id: userId,
      username: username,
      walletAddress: walletAddress
    };

    game.players.push(player);
    game.status = 'playing';
    
    const updatedGame = await this.gameService.updateGame(game.id, game);
    if (!updatedGame) {
      throw new Error('Failed to update game');
    }

    client.join(`game:${game.id}`);
    this.server.to(`game:${game.id}`).emit('gameStarted', updatedGame);

    // For Coinflip, determine winner immediately
    if (game.gameType === 'coinflip' && game.players.length === 2) {
      setTimeout(() => {
        this.resolveCoinflip(updatedGame);
      }, 3000); // Add 3s delay for animation
    }

    return updatedGame;
  }

  private async resolveCoinflip(game: Game) {
    // Randomly select winner
    const winnerIndex = Math.floor(Math.random() * 2);
    game.winner = game.players[winnerIndex];
    game.status = 'completed';

    const updatedGame = await this.gameService.updateGame(game.id, game);
    if (updatedGame) {
      this.server.to(`game:${game.id}`).emit('gameCompleted', updatedGame);
      
      // Remove game after a delay
      setTimeout(async () => {
        await this.gameService.deleteGame(game.id);
      }, 30000); // Keep game data for 30s after completion
    }
  }

  @SubscribeMessage('getActiveGames')
  async handleGetActiveGames() {
    return this.gameService.findActiveGames();
  }
} 