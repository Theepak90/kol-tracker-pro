import { API_CONFIG } from '../config/api';
import { apiService } from './apiService';

export interface User {
  _id: string;
  username: string;
  email: string;
  walletAddress?: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise' | 'custom';
  avatar?: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  private tokenKey = 'token';
  private userKey = 'user';
  private user: User | null = null;

  constructor() {
    // Try to load auth state from localStorage
    this.loadAuthState();
  }

  private loadAuthState() {
    try {
      const token = localStorage.getItem(this.tokenKey);
      const userStr = localStorage.getItem(this.userKey);
      
      if (token && userStr) {
        this.user = JSON.parse(userStr);
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
      this.logout();
    }
  }

  private saveAuthState(token: string, user: User) {
    try {
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.userKey, JSON.stringify(user));
      this.user = user;
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', {
      email,
      password
    });
    this.saveAuthState(response.data.token, response.data.user);
    return response.data;
  }

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register', {
      username,
      email,
      password
    });
    this.saveAuthState(response.data.token, response.data.user);
    return response.data;
  }

  async logout() {
    try {
      // Call logout endpoint if needed
      if (this.getToken()) {
        await apiService.post('/auth/logout', {});
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      this.user = null;
    }
  }

  async getProfile(): Promise<User> {
    const response = await apiService.get<User>('/auth/me');
    this.user = response.data;
    localStorage.setItem(this.userKey, JSON.stringify(response.data));
    return response.data;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
      }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.user = null;
  }

  isAuthenticated(): boolean {
    return !!this.user && !!this.getToken();
  }

  getUser(): User | null {
    return this.user;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiService.put<User>('/auth/profile', data);
    this.user = response.data;
    localStorage.setItem(this.userKey, JSON.stringify(response.data));
    return response.data;
  }
}

export const authService = new AuthService(); 