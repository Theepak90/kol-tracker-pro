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

const apiService = {
  // KOL endpoints
  getKOLs: async (): Promise<KOL[]> => {
    const response = await api.get<KOL[]>('/api/kols');
    return response.data;
  },

  createKOL: async (kolData: Omit<KOL, '_id' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<KOL> => {
    const response = await api.post<KOL>('/api/kols', kolData);
    return response.data;
  },

  getKOL: async (username: string): Promise<KOL> => {
    const response = await api.get<KOL>(`/api/kols/${username}`);
    return response.data;
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
    const response = await api.post('/api/auth/login', credentials);
    return response;
  },

  async register(userData: any) {
    const response = await api.post('/api/auth/register', userData);
    return response;
  },

  async getProfile() {
    const response = await api.get('/api/auth/me');
    return response;
  }
};

export { apiService }; 