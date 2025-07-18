import { io, Socket } from 'socket.io-client';
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
  gameData?: any;
}

interface Player {
  id: string;
  username: string;
  avatar?: string;
  walletAddress: string;
}

interface GameUpdate {
  roomId: string;
  type: string;
  data: any;
}

class WebSocketService {
  private socket: Socket | null = null;
  private gameCallbacks: Map<string, (update: GameUpdate) => void> = new Map();
  private connectionCallbacks: ((connected: boolean) => void)[] = [];

  connect() {
    // Disable WebSocket connections in production (Vercel doesn't support them)
    if (process.env.NODE_ENV === 'production') {
      console.log('🔇 WebSocket disabled in production environment');
      return;
    }

    if (this.socket?.connected) return;

    try {
      this.socket = io(`${WS_URL}/games`, {
        transports: ['websocket'],
        autoConnect: true,
        timeout: 5000,
        auth: {
          token: localStorage.getItem('token') || '',
          userId: localStorage.getItem('userId') || '',
          username: localStorage.getItem('username') || 'Anonymous',
          walletAddress: localStorage.getItem('walletAddress') || ''
        }
      });
        
      this.socket.on('connect', () => {
        console.log('🟢 Connected to game server');
        this.connectionCallbacks.forEach(cb => cb(true));
      });

      this.socket.on('disconnect', () => {
        console.log('🔴 Disconnected from game server');
        this.connectionCallbacks.forEach(cb => cb(false));
      });

      this.socket.on('game_update', (update: GameUpdate) => {
        console.log('🎮 Game update:', update);
        const callback = this.gameCallbacks.get(update.roomId);
        if (callback) {
          callback(update);
        }
      });

      this.socket.on('room_update', (room: GameRoom) => {
        console.log('🏠 Room update:', room);
        // Handle room-level updates
      });

      this.socket.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
      });
    } catch (error) {
      console.warn('🔇 WebSocket connection failed, continuing without real-time features');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Game Room Management - Mock implementations for production
  createGameRoom(gameType: string, betAmount: number, currency: 'SOL' | 'USDT'): Promise<GameRoom> {
    return new Promise((resolve, reject) => {
      if (process.env.NODE_ENV === 'production') {
        reject(new Error('Game rooms not available in production'));
        return;
      }

      if (!this.socket?.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('create_room', { gameType, betAmount, currency }, (response: any) => {
        if (response.success) {
          resolve(response.room);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  joinGameRoom(roomId: string): Promise<GameRoom> {
    return new Promise((resolve, reject) => {
      if (process.env.NODE_ENV === 'production') {
        reject(new Error('Game rooms not available in production'));
        return;
      }

      if (!this.socket?.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('join_room', { roomId }, (response: any) => {
        if (response.success) {
          resolve(response.room);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Quick Match - Mock for production
  findQuickMatch(gameType: string, betAmount: number, currency: 'SOL' | 'USDT'): Promise<GameRoom> {
    return new Promise((resolve, reject) => {
      if (process.env.NODE_ENV === 'production') {
        reject(new Error('Quick match not available in production'));
        return;
      }

      if (!this.socket?.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('quick_match', { gameType, betAmount, currency }, (response: any) => {
        if (response.success) {
          resolve(response.room);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Get available rooms - Mock for production
  getAvailableRooms(gameType?: string): Promise<GameRoom[]> {
    return new Promise((resolve, reject) => {
      if (process.env.NODE_ENV === 'production') {
        resolve([]); // Return empty array in production
        return;
      }

      if (!this.socket?.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('get_rooms', { gameType }, (response: any) => {
        if (response.success) {
          resolve(response.rooms);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Callback management
  onGameUpdate(roomId: string, callback: (update: GameUpdate) => void) {
    this.gameCallbacks.set(roomId, callback);
  }

  offGameUpdate(roomId: string) {
    this.gameCallbacks.delete(roomId);
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionCallbacks.push(callback);
  }

  isConnected(): boolean {
    if (process.env.NODE_ENV === 'production') {
      return false; // Always return false in production
    }
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();