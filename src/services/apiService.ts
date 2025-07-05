import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Mock data for production
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

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

export const apiService = {
  // KOL endpoints
  async getKOLs() {
    try {
      if (!isDevelopment) {
        // Return mock data for production
        return { data: mockKOLs };
      }
      const response = await api.get('/api/kols');
      return response;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return { data: mockKOLs };
    }
  },

  async createKOL(kolData: any) {
    try {
      if (!isDevelopment) {
        // Return mock success for production
        return { data: { ...kolData, _id: 'mock' + Date.now(), createdAt: new Date().toISOString() } };
      }
      const response = await api.post('/api/kols', kolData);
      return response;
    } catch (error) {
      console.warn('API call failed:', error);
      throw error;
    }
  },

  async getKOL(username: string) {
    try {
      if (!isDevelopment) {
        // Return mock data for production
        return { data: mockKOLs.find(k => k.telegramUsername === username) || mockKOLs[0] };
      }
      const response = await api.get(`/api/kols/${username}`);
      return response;
    } catch (error) {
      console.warn('API call failed:', error);
      return { data: mockKOLs[0] };
    }
  },

  async updateKOL(username: string, kolData: any) {
    try {
      if (!isDevelopment) {
        // Return mock success for production
        return { data: { ...kolData, updatedAt: new Date().toISOString() } };
      }
      const response = await api.put(`/api/kols/${username}`, kolData);
      return response;
    } catch (error) {
      console.warn('API call failed:', error);
      throw error;
    }
  },

  async deleteKOL(username: string) {
    try {
      if (!isDevelopment) {
        // Return mock success for production
        return { data: { message: 'KOL deleted successfully' } };
      }
      const response = await api.delete(`/api/kols/${username}`);
      return response;
    } catch (error) {
      console.warn('API call failed:', error);
      throw error;
    }
  },

  // Auth endpoints (mock for now)
  async login(credentials: any) {
    return { data: { token: 'mock-token', user: { username: 'demo' } } };
  },

  async register(userData: any) {
    return { data: { message: 'User registered successfully' } };
  },

  async getProfile() {
    return { data: { username: 'demo', email: 'demo@example.com' } };
  }
};

export default apiService; 