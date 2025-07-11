import { io, Socket } from 'socket.io-client';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletAdapter } from '@solana/wallet-adapter-base';
import { WS_URL } from '../config/api';

export interface GameRoom {
  id: string;
  gameType: 'coinflip' | 'jackpot' | 'kol_predictor' | 'market_master';
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  betAmount: number;
  currency: 'SOL' | 'USDT';
  createdAt: string;
  winner?: Player;
  jackpotValue?: number;
  timeRemaining?: number;
}

export interface Player {
  id: string;
  username: string;
  avatar?: string;
  walletAddress: string;
  betAmount?: number;
  choice?: 'heads' | 'tails';
  isWinner?: boolean;
  level?: number;
}

export interface GameUpdate {
  type: 'player_joined' | 'game_started' | 'game_finished' | 'bet_placed' | 'timer_update' | 'jackpot_spin';
  data: any;
  roomId: string;
}

class RealtimeGameService {
  private socket: Socket | null = null;
  private connection: Connection;
  private activeGames: Map<string, GameRoom> = new Map();
  private gameCallbacks: Map<string, (update: GameUpdate) => void> = new Map();
  private connectionCallbacks: Set<(connected: boolean) => void> = new Set();

  constructor() {
    this.connection = new Connection('https://api.devnet.solana.com');
    // Delay socket initialization to ensure DOM is ready
    setTimeout(() => {
      this.initializeSocket();
    }, 100);
  }

  private initializeSocket() {
    this.socket = io(`${WS_URL}/games`, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true,
      transports: ['websocket', 'polling'],
      auth: {
        token: localStorage.getItem('token') || '',
        userId: localStorage.getItem('userId') || '',
        username: localStorage.getItem('username') || 'Anonymous',
        walletAddress: localStorage.getItem('walletAddress') || ''
      }
    });

    this.socket.on('connect', () => {
      console.log('🟢 Connected to game server');
      this.connectionCallbacks.forEach(callback => callback(true));
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔴 Disconnected from game server:', reason);
      this.connectionCallbacks.forEach(callback => callback(false));
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      this.connectionCallbacks.forEach(callback => callback(false));
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected to game server after', attemptNumber, 'attempts');
      this.connectionCallbacks.forEach(callback => callback(true));
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🔄❌ Reconnection error:', error);
    });

    this.socket.on('room_created', (room: GameRoom) => {
      this.activeGames.set(room.id, room);
    });

    this.socket.on('game_update', (update: GameUpdate) => {
      const callback = this.gameCallbacks.get(update.roomId);
      if (callback) {
        callback(update);
      }
      
      // Update local game state
      if (this.activeGames.has(update.roomId)) {
        const game = this.activeGames.get(update.roomId)!;
        this.activeGames.set(update.roomId, { ...game, ...update.data });
      }
    });

    this.socket.on('game_result', (result: { roomId: string; winner: Player; prize: number }) => {
      const callback = this.gameCallbacks.get(result.roomId);
      if (callback) {
        callback({
          type: 'game_finished',
          data: result,
          roomId: result.roomId
        });
      }
    });
  }

  // Wallet Integration Methods
  async createGameWithWallet(
    gameType: string, 
    betAmount: number, 
    currency: 'SOL' | 'USDT',
    wallet: WalletAdapter
  ): Promise<GameRoom> {
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    // Create escrow transaction
    const escrowTx = await this.createEscrowTransaction(
      wallet.publicKey,
      betAmount,
      currency
    );

    // Sign and send transaction
    const txId = await wallet.sendTransaction(escrowTx, this.connection);
    await this.connection.confirmTransaction(txId);

    // Create game room after successful transaction
    return new Promise((resolve, reject) => {
      this.socket?.emit('create_room', {
        gameType,
        betAmount,
        currency,
        walletAddress: wallet.publicKey!.toString(),
        escrowTxId: txId
      }, (response: any) => {
        if (response.success) {
          this.activeGames.set(response.room.id, response.room);
          resolve(response.room);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async joinGameWithWallet(
    roomId: string, 
    wallet: WalletAdapter
  ): Promise<GameRoom> {
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const room = this.activeGames.get(roomId);
    if (!room) {
      throw new Error('Game room not found');
    }

    // Create escrow transaction
    const escrowTx = await this.createEscrowTransaction(
      wallet.publicKey,
      room.betAmount,
      room.currency
    );

    // Sign and send transaction
    const txId = await wallet.sendTransaction(escrowTx, this.connection);
    await this.connection.confirmTransaction(txId);

    // Join game room after successful transaction
    return new Promise((resolve, reject) => {
      this.socket?.emit('join_room', {
        roomId,
        walletAddress: wallet.publicKey!.toString(),
        escrowTxId: txId
      }, (response: any) => {
        if (response.success) {
          this.activeGames.set(roomId, response.room);
          resolve(response.room);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async placeBet(
    roomId: string, 
    betAmount: number, 
    wallet: WalletAdapter
  ): Promise<void> {
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    // Create bet transaction
    const betTx = await this.createEscrowTransaction(
      wallet.publicKey,
      betAmount,
      'SOL'
    );

    // Sign and send transaction
    const txId = await wallet.sendTransaction(betTx, this.connection);
    await this.connection.confirmTransaction(txId);

    // Emit bet to server
    this.socket?.emit('place_bet', {
      roomId,
      betAmount,
      walletAddress: wallet.publicKey!.toString(),
      txId
    });
  }

  private async createEscrowTransaction(
    fromPubkey: PublicKey,
    amount: number,
    currency: 'SOL' | 'USDT'
  ): Promise<Transaction> {
    const transaction = new Transaction();
    
    // For SOL transfers
    if (currency === 'SOL') {
      const escrowPubkey = new PublicKey('11111111111111111111111111111111'); // Platform escrow wallet
      
      transaction.add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey: escrowPubkey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );
    }
    
    // Get recent blockhash
    const { blockhash } = await this.connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;
    
    return transaction;
  }

  // Real-time Game Methods
  subscribeToGame(roomId: string, callback: (update: GameUpdate) => void) {
    this.gameCallbacks.set(roomId, callback);
    this.socket?.emit('subscribe_to_game', { roomId });
  }

  unsubscribeFromGame(roomId: string) {
    this.gameCallbacks.delete(roomId);
    this.socket?.emit('unsubscribe_from_game', { roomId });
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionCallbacks.add(callback);
    return () => this.connectionCallbacks.delete(callback);
  }

  // Coinflip specific methods
  makeCoinflipChoice(roomId: string, choice: 'heads' | 'tails') {
    this.socket?.emit('coinflip_choice', { roomId, choice });
  }

  // Jackpot specific methods
  getJackpotValue(roomId: string): number {
    const game = this.activeGames.get(roomId);
    return game?.jackpotValue || 0;
  }

  // Get all active games
  getActiveGames(): GameRoom[] {
    return Array.from(this.activeGames.values());
  }

  // Get specific game
  getGame(roomId: string): GameRoom | undefined {
    return this.activeGames.get(roomId);
  }

  // Quick match with wallet
  async quickMatchWithWallet(
    gameType: string,
    betAmount: number,
    currency: 'SOL' | 'USDT',
    wallet: WalletAdapter
  ): Promise<GameRoom> {
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    // Create escrow transaction
    const escrowTx = await this.createEscrowTransaction(
      wallet.publicKey,
      betAmount,
      currency
    );

    // Sign and send transaction
    const txId = await wallet.sendTransaction(escrowTx, this.connection);
    await this.connection.confirmTransaction(txId);

    return new Promise((resolve, reject) => {
      this.socket?.emit('quick_match', {
        gameType,
        betAmount,
        currency,
        walletAddress: wallet.publicKey!.toString(),
        escrowTxId: txId
      }, (response: any) => {
        if (response.success) {
          this.activeGames.set(response.room.id, response.room);
          resolve(response.room);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Leave game
  leaveGame(roomId: string) {
    this.socket?.emit('leave_room', { roomId });
    this.activeGames.delete(roomId);
    this.gameCallbacks.delete(roomId);
  }

  // Get wallet balance
  async getWalletBalance(publicKey: PublicKey): Promise<number> {
    const balance = await this.connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Force reconnection
  forceReconnect() {
    if (this.socket) {
      this.socket.disconnect();
      setTimeout(() => {
        this.socket?.connect();
      }, 500);
    }
  }

  // Test connection
  testConnection() {
    console.log('Testing connection...');
    console.log('Socket exists:', !!this.socket);
    console.log('Socket connected:', this.socket?.connected);
    console.log('Socket ID:', this.socket?.id);
    
    if (this.socket) {
      this.socket.emit('ping', 'test');
    }
  }

  // Disconnect
  disconnect() {
    this.socket?.disconnect();
    this.activeGames.clear();
    this.gameCallbacks.clear();
    this.connectionCallbacks.clear();
  }
}

export const realtimeGameService = new RealtimeGameService(); 