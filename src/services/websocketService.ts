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

export interface Player {
  id: string;
  username: string;
  avatar?: string;
  walletAddress: string;
  choice?: any;
  isReady?: boolean;
}

export interface GameUpdate {
  type: 'player_joined' | 'player_left' | 'game_started' | 'player_choice' | 'game_result' | 'countdown';
  data: any;
  roomId: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private gameCallbacks: Map<string, (update: GameUpdate) => void> = new Map();
  private connectionCallbacks: ((connected: boolean) => void)[] = [];

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(WS_URL, {
      transports: ['websocket'],
      autoConnect: true,
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
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Game Room Management
  createGameRoom(gameType: string, betAmount: number, currency: 'SOL' | 'USDT'): Promise<GameRoom> {
    return new Promise((resolve, reject) => {
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

  leaveGameRoom(roomId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_room', { roomId });
    }
  }

  // Game Actions
  makeGameChoice(roomId: string, choice: any) {
    if (this.socket?.connected) {
      this.socket.emit('game_choice', { roomId, choice });
    }
  }

  setPlayerReady(roomId: string, ready: boolean = true) {
    if (this.socket?.connected) {
      this.socket.emit('player_ready', { roomId, ready });
  }
  }

  // Quick Match
  findQuickMatch(gameType: string, betAmount: number, currency: 'SOL' | 'USDT'): Promise<GameRoom> {
    return new Promise((resolve, reject) => {
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

  // Get available rooms
  getAvailableRooms(gameType?: string): Promise<GameRoom[]> {
    return new Promise((resolve, reject) => {
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

  // Event Subscriptions
  subscribeToGame(roomId: string, callback: (update: GameUpdate) => void) {
    this.gameCallbacks.set(roomId, callback);
  }

  unsubscribeFromGame(roomId: string) {
    this.gameCallbacks.delete(roomId);
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionCallbacks.push(callback);
  }

  // Send chat message
  sendChatMessage(roomId: string, message: string) {
    if (this.socket?.connected) {
      this.socket.emit('chat_message', { roomId, message });
    }
  }

  // Emotes and reactions
  sendEmote(roomId: string, emote: string) {
    if (this.socket?.connected) {
      this.socket.emit('emote', { roomId, emote });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();