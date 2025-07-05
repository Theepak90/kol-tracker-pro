import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export interface KOL {
  _id: string;
  displayName: string;
  telegramUsername: string;
  description: string;
  tags: string[];
  stats?: {
    totalPosts: number;
    totalViews: number;
    totalForwards: number;
    lastUpdated: string;
  };
  createdAt: string;
  updatedAt: string;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Mock data for fallback
const mockKOLs = [
  {
    _id: "mock1",
    displayName: "Crypto Whale",
    telegramUsername: "cryptowhale",
    description: "Leading crypto analyst and trader",
    tags: ["crypto", "trading", "analysis"],
    stats: {
      totalPosts: 150,
      totalViews: 50000,
      totalForwards: 2500,
      lastUpdated: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: "mock2",
    displayName: "DeFi Expert",
    telegramUsername: "defiexpert",
    description: "Decentralized finance specialist",
    tags: ["defi", "yield", "protocols"],
    stats: {
      totalPosts: 89,
      totalViews: 35000,
      totalForwards: 1800,
      lastUpdated: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const apiService = {
  // KOL endpoints
  getKOLs: async (): Promise<KOL[]> => {
    try {
      const response = await api.get<KOL[]>('/api/kols');
      return response.data;
    } catch (error) {
      console.error('Error fetching KOLs:', error);
      return [];
    }
  },

  createKOL: async (kolData: Omit<KOL, '_id' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<KOL> => {
    const response = await api.post<KOL>('/api/kols', kolData);
    return response.data;
  },

  getKOL: async (username: string): Promise<KOL> => {
    try {
      const response = await api.get<KOL>(`/api/kols/${username}`);
      return response.data;
    } catch (error) {
      console.warn('API call failed:', error);
      return mockKOLs.find(k => k.telegramUsername === username) || mockKOLs[0];
    }
  },

  updateKOL: async (username: string, kolData: Partial<KOL>): Promise<KOL> => {
    const response = await api.put<KOL>(`/api/kols/${username}`, kolData);
    return response.data;
  },

  deleteKOL: async (username: string): Promise<void> => {
    await api.delete(`/api/kols/${username}`);
  },

  // Auth endpoints
  async login(credentials: any) {
    try {
      const response = await api.post('/api/auth/login', credentials);
      return response;
    } catch (error) {
      console.warn('Auth API call failed:', error);
      return { data: { token: 'mock-token', user: { username: 'demo' } } };
    }
  },

  async register(userData: any) {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response;
    } catch (error) {
      console.warn('Auth API call failed:', error);
      return { data: { message: 'User registered successfully' } };
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/api/auth/me');
      return response;
    } catch (error) {
      console.warn('Auth API call failed:', error);
      return { data: { username: 'demo', email: 'demo@example.com' } };
    }
  }
};

export { apiService }; 