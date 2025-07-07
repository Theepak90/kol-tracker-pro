import { API_BASE_URL } from '../config/api';

interface KOL {
  _id: string;
  displayName: string;
  telegramUsername: string;
  description: string;
  tags: string[];
  stats: {
    totalPosts: number;
    totalViews: number;
    totalForwards: number;
  };
  discoveredFrom?: string;
}

// Fallback data when backend is unavailable
const FALLBACK_KOLS: KOL[] = [
  {
    _id: 'demo-1',
    displayName: 'Crypto Alpha',
    telegramUsername: 'cryptoalpha',
    description: 'Leading crypto influencer with market insights',
    tags: ['Crypto', 'Trading', 'Alpha'],
    stats: {
      totalPosts: 245,
      totalViews: 125000,
      totalForwards: 8500
    },
    discoveredFrom: 'Demo Data'
  },
  {
    _id: 'demo-2',
    displayName: 'DeFi Guru',
    telegramUsername: 'defiguru',
    description: 'DeFi expert sharing yield farming strategies',
    tags: ['DeFi', 'Yield Farming', 'Analytics'],
    stats: {
      totalPosts: 189,
      totalViews: 98000,
      totalForwards: 6200
    },
    discoveredFrom: 'Demo Data'
  },
  {
    _id: 'demo-3',
    displayName: 'NFT Collector',
    telegramUsername: 'nftcollector',
    description: 'NFT market analysis and collection insights',
    tags: ['NFT', 'Art', 'Collections'],
    stats: {
      totalPosts: 156,
      totalViews: 67000,
      totalForwards: 3400
    },
    discoveredFrom: 'Demo Data'
  }
];

class ApiService {
  private baseUrl: string;
  private isOnline: boolean = true;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.checkConnectivity();
  }

  private async checkConnectivity(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'HEAD',
        timeout: 5000
      } as RequestInit);
      this.isOnline = response.ok;
      return this.isOnline;
    } catch (error) {
      console.warn('Backend service unavailable, using fallback data');
      this.isOnline = false;
      return false;
    }
  }

  async getKOLs(): Promise<KOL[]> {
    try {
      // First check if backend is available
      const isBackendAvailable = await this.checkConnectivity();
      
      if (!isBackendAvailable) {
        console.log('📱 Using demo data - backend service unavailable');
        return FALLBACK_KOLS;
      }

      const response = await fetch(`${this.baseUrl}/api/kols`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : FALLBACK_KOLS;
    } catch (error) {
      console.error('❌ Error fetching KOLs:', error);
      console.log('📱 Using demo data as fallback');
      return FALLBACK_KOLS;
    }
  }

  async createKOL(kolData: Partial<KOL>): Promise<KOL> {
    try {
      const isBackendAvailable = await this.checkConnectivity();
      
      if (!isBackendAvailable) {
        // Create a demo KOL when backend is unavailable
        const demoKOL: KOL = {
          _id: `demo-${Date.now()}`,
          displayName: kolData.displayName || 'Demo KOL',
          telegramUsername: kolData.telegramUsername || 'demo_user',
          description: kolData.description || 'Demo KOL created when backend is unavailable',
          tags: kolData.tags || ['Demo'],
          stats: {
            totalPosts: 0,
            totalViews: 0,
            totalForwards: 0
          },
          discoveredFrom: 'Demo Creation'
        };
        console.log('📱 Created demo KOL - backend service unavailable');
        return demoKOL;
      }

      const response = await fetch(`${this.baseUrl}/api/kols`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kolData),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error creating KOL:', error);
      // Return a demo KOL as fallback
      const demoKOL: KOL = {
        _id: `demo-${Date.now()}`,
        displayName: kolData.displayName || 'Demo KOL',
        telegramUsername: kolData.telegramUsername || 'demo_user',
        description: kolData.description || 'Demo KOL created when backend is unavailable',
        tags: kolData.tags || ['Demo'],
        stats: {
          totalPosts: 0,
          totalViews: 0,
          totalForwards: 0
        },
        discoveredFrom: 'Demo Creation'
      };
      return demoKOL;
    }
  }

  async updateKOL(id: string, updates: Partial<KOL>): Promise<KOL> {
    try {
      const isBackendAvailable = await this.checkConnectivity();
      
      if (!isBackendAvailable) {
        console.log('📱 Demo mode - KOL update simulated');
        // Find the KOL in fallback data and return updated version
        const existingKOL = FALLBACK_KOLS.find(k => k._id === id);
        return { ...existingKOL, ...updates } as KOL;
      }

      const response = await fetch(`${this.baseUrl}/api/kols/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error updating KOL:', error);
      throw error;
    }
  }

  async deleteKOL(id: string): Promise<void> {
    try {
      const isBackendAvailable = await this.checkConnectivity();
      
      if (!isBackendAvailable) {
        console.log('📱 Demo mode - KOL deletion simulated');
        return;
      }

      const response = await fetch(`${this.baseUrl}/api/kols/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error deleting KOL:', error);
      throw error;
    }
  }

  getConnectionStatus(): boolean {
    return this.isOnline;
  }
}

export const apiService = new ApiService();
export default apiService; 