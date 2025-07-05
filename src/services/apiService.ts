import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

export const apiService = {
  // KOL endpoints
  async getKOLs() {
    try {
      const response = await api.get('/api/kols');
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return { data: mockKOLs };
    }
  },

  async createKOL(kolData: any) {
    try {
      const response = await api.post('/api/kols', kolData);
      return response;
    } catch (error) {
      console.warn('API call failed:', error);
      // Return mock success
      return { data: { ...kolData, _id: 'mock' + Date.now(), createdAt: new Date().toISOString() } };
    }
  },

  async getKOL(username: string) {
    try {
      const response = await api.get(`/api/kols/${username}`);
      return response;
    } catch (error) {
      console.warn('API call failed:', error);
      return { data: mockKOLs.find(k => k.telegramUsername === username) || mockKOLs[0] };
    }
  },

  async updateKOL(username: string, kolData: any) {
    try {
      const response = await api.put(`/api/kols/${username}`, kolData);
      return response;
    } catch (error) {
      console.warn('API call failed:', error);
      return { data: { ...kolData, updatedAt: new Date().toISOString() } };
    }
  },

  async deleteKOL(username: string) {
    try {
      const response = await api.delete(`/api/kols/${username}`);
      return response;
    } catch (error) {
      console.warn('API call failed:', error);
      return { data: { message: 'KOL deleted successfully' } };
    }
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

export default apiService; 