import { API_BASE_URL, IS_DEMO_MODE } from '../config/api';
import { demoService, shouldUseDemoData } from './demoService';

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
    
    // In demo mode, don't try to check connectivity
    if (!shouldUseDemoData()) {
      this.checkConnectivity();
    } else {
      console.log('🎭 Running in demo mode - using mock data');
      this.isOnline = false; // Force offline mode for demo
    }
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
    // Use demo data if in demo mode or offline
    if (shouldUseDemoData() || !this.isOnline) {
      console.log('🎭 Using demo KOL data');
      return await demoService.getKOLsAsync();
    }

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
      console.error('❌ Error fetching KOLs, falling back to demo data:', error);
      this.isOnline = false;
      // Fallback to demo data instead of throwing error
      return await demoService.getKOLsAsync();
    }
  }

  async createKOL(kolData: Partial<KOL>): Promise<KOL> {
    // Use demo data if in demo mode or offline
    if (shouldUseDemoData() || !this.isOnline) {
      console.log('🎭 Creating demo KOL');
      return await demoService.createKOLAsync(kolData);
    }

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
      console.error('❌ Error creating KOL, using demo mode:', error);
      this.isOnline = false;
      // Fallback to demo data instead of throwing error
      return await demoService.createKOLAsync(kolData);
    }
  }

  // Add other methods as needed
  async updateKOL(id: string, kolData: Partial<KOL>): Promise<KOL> {
    if (shouldUseDemoData() || !this.isOnline) {
      console.log('🎭 Demo mode: Update not persisted');
      // Return the updated data but don't actually persist it
      return { 
        _id: id, 
        ...kolData,
        displayName: kolData.displayName || 'Updated KOL',
        telegramUsername: kolData.telegramUsername || 'demo_user',
        description: kolData.description || 'Updated description',
        tags: kolData.tags || ['Demo'],
        stats: kolData.stats || { totalPosts: 0, totalViews: 0, totalForwards: 0 }
      } as KOL;
    }

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
    if (shouldUseDemoData() || !this.isOnline) {
      console.log('🎭 Demo mode: Delete not persisted');
      return true; // Pretend it worked
    }

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

  // Generic method for other API calls
  async get<T>(endpoint: string): Promise<{ data: T; success: boolean }> {
    if (shouldUseDemoData() || !this.isOnline) {
      console.log('🎭 Demo mode: API call simulated');
      return { data: {} as T, success: true };
    }

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

  // Check if we're in demo mode
  isDemoMode(): boolean {
    return shouldUseDemoData();
  }

  // Check connectivity status
  isConnected(): boolean {
    return this.isOnline && !shouldUseDemoData();
  }
}

export const apiService = new ApiService();