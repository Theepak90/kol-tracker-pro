import { API_CONFIG } from '../config/api';

interface RateLimitInfo {
  remaining: number;
  reset?: number;
  lastUpdated: number;
}

interface RateLimitConfig {
  requests: number;
  window: number; // in milliseconds
}

export class RateLimitService {
  private rateLimits: Map<string, RateLimitInfo>;
  private rateLimitConfigs: Map<string, RateLimitConfig>;

  constructor() {
    this.rateLimits = new Map();
    this.rateLimitConfigs = new Map(Object.entries(API_CONFIG.rateLimits));
  }

  updateRateLimit(service: string, info: { remaining: number; reset?: number }): void {
    this.rateLimits.set(service, {
      ...info,
      lastUpdated: Date.now(),
    });
  }

  async checkRateLimit(service: string): Promise<boolean> {
    const limitInfo = this.rateLimits.get(service);
    const config = this.rateLimitConfigs.get(service);

    if (!config) {
      return true; // No rate limit configured for this service
    }

    if (!limitInfo) {
      // First request, initialize rate limit info
      this.updateRateLimit(service, { remaining: config.requests });
      return true;
    }

    if (limitInfo.remaining <= 0) {
      if (limitInfo.reset && Date.now() < limitInfo.reset * 1000) {
        await this.waitForRateLimit(service);
        return true;
      }

      // Check if window has passed since last update
      if (Date.now() - limitInfo.lastUpdated >= config.window) {
        this.updateRateLimit(service, { remaining: config.requests });
        return true;
      }

      return false;
    }

    return true;
  }

  async waitForRateLimit(service: string, resetTime?: number): Promise<void> {
    const limitInfo = this.rateLimits.get(service);
    
    if (resetTime) {
      const waitTime = (resetTime * 1000) - Date.now();
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      return;
    }
    
    if (!limitInfo || !limitInfo.reset) {
      // If no reset time is available, wait for the configured window
      const config = this.rateLimitConfigs.get(service);
      if (config) {
        await new Promise(resolve => setTimeout(resolve, config.window));
      }
      return;
    }

    const waitTime = (limitInfo.reset * 1000) - Date.now();
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Reset the rate limit info
    const config = this.rateLimitConfigs.get(service);
    if (config) {
      this.updateRateLimit(service, { remaining: config.requests });
    }
  }

  getRemainingRequests(service: string): number {
    const config = API_CONFIG.rateLimits[service as keyof typeof API_CONFIG.rateLimits];
    if (!config) return Infinity;

    const limit = this.rateLimits.get(service);
    if (!limit) return config.requests;

    const now = Date.now();
    if (now - limit.lastUpdated >= config.window) {
      return config.requests;
    }

    return Math.max(0, config.requests - limit.remaining);
  }
}

export const rateLimitService = new RateLimitService();