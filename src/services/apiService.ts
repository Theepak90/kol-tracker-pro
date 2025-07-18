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

class ApiService {
  private baseUrl: string;
  private isOnline: boolean = true;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.checkConnectivity();
  }

  private async checkConnectivity(): Promise<boolean> {
    try {
      // Use the main API endpoint that we know works
      const response = await fetch(`${this.baseUrl}/api`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });
      this.isOnline = response.ok;
      
      if (this.isOnline) {
        console.log('✅ Backend connected successfully');
      } else {
        console.warn('⚠️ Backend responded but not healthy');
      }
      
      return this.isOnline;
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      this.isOnline = false;
      return false;
    }
  }

  async getKOLs(): Promise<KOL[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/kols`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch KOLs: HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Loaded KOLs from backend:', data.length || 0);
      
      this.isOnline = true;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Error fetching KOLs:', error);
      this.isOnline = false;
      throw new Error('Backend service is not available. Cannot fetch real-time KOL data.');
    }
  }

  async createKOL(kolData: Partial<KOL>): Promise<KOL> {
    try {
      const response = await fetch(`${this.baseUrl}/api/kols`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kolData),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Backend error:', errorData);
        throw new Error(`Failed to create KOL: HTTP ${response.status}`);
      }

      const result = await response.json();
      this.isOnline = true;
      return result;
    } catch (error) {
      console.error('❌ Error creating KOL:', error);
      this.isOnline = false;
      throw new Error('Backend service is not available. Cannot create KOL with real-time data.');
    }
  }

  async updateKOL(id: string, kolData: Partial<KOL>): Promise<KOL> {
    try {
      const response = await fetch(`${this.baseUrl}/api/kols/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kolData),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`Failed to update KOL: HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error updating KOL:', error);
      throw error;
    }
  }

  async deleteKOL(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/kols/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(10000)
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Error deleting KOL:', error);
      return false;
    }
  }

  async get<T>(endpoint: string): Promise<{ data: T; success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      console.error(`❌ Error fetching ${endpoint}:`, error);
      return { data: {} as T, success: false };
    }
  }

  isConnected(): boolean {
    return this.isOnline;
  }
}

export const apiService = new ApiService();