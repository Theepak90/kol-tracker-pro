import { API_CONFIG } from '../config/api';
import { APIService } from './apiService';
import { APIResponse } from '../types/api';

interface TokenPrice {
  price_usd: number;
  price_change_24h: number;
  volume_24h: number;
  market_cap: number;
  last_updated: number;
}

interface DexPair {
  address: string;
  chain: string;
  dex: string;
  token0: {
    address: string;
    symbol: string;
    decimals: number;
  };
  token1: {
    address: string;
    symbol: string;
    decimals: number;
  };
  liquidity_usd: number;
  volume_24h: number;
}

class MarketDataService {
  private coingeckoAPI: APIService;
  private dextoolsAPI: APIService;
  private dexscreenerAPI: APIService;

  constructor() {
    this.coingeckoAPI = new APIService({
      baseUrl: API_CONFIG.coingecko.baseUrl,
      apiKey: API_CONFIG.coingecko.apiKey,
      headers: {
        'x-cg-pro-api-key': API_CONFIG.coingecko.apiKey || '',
      },
      retry: {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
      },
    }, 'coingecko');

    this.dextoolsAPI = new APIService({
      baseUrl: API_CONFIG.dextools.baseUrl,
      apiKey: API_CONFIG.dextools.apiKey,
      headers: {
        'X-API-Key': API_CONFIG.dextools.apiKey || '',
      },
      retry: {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
      },
    }, 'dextools');

    this.dexscreenerAPI = new APIService({
      baseUrl: API_CONFIG.dexscreener.baseUrl,
      retry: {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
      },
    }, 'dexscreener');
  }

  async getTokenPrice(tokenAddress: string, chain: string = 'ethereum'): Promise<APIResponse<TokenPrice>> {
    try {
      // Try CoinGecko first
      const cgResponse = await this.coingeckoAPI.request<any>({
        method: 'GET',
        url: `/simple/token_price/${chain}`,
        params: {
          contract_addresses: tokenAddress,
          vs_currencies: 'usd',
          include_24hr_vol: true,
          include_24hr_change: true,
          include_market_cap: true,
        }
      });

      if (cgResponse.success && cgResponse.data[tokenAddress.toLowerCase()]) {
        const data = cgResponse.data[tokenAddress.toLowerCase()];
        return {
          success: true,
          data: {
            price_usd: data.usd,
            price_change_24h: data.usd_24h_change || 0,
            volume_24h: data.usd_24h_vol || 0,
            market_cap: data.usd_market_cap || 0,
            last_updated: Date.now(),
          },
          timestamp: Date.now(),
          meta: cgResponse.meta,
        };
      }

      // Fallback to DEX data
      const dexResponse = await this.getDEXPairData(tokenAddress, chain);
      
      if (dexResponse.success && dexResponse.data) {
        const pair = dexResponse.data;
        return {
          success: true,
          data: {
            price_usd: this.calculateTokenPrice(pair),
            price_change_24h: 0, // Not available from DEX directly
            volume_24h: pair.volume_24h,
            market_cap: pair.liquidity_usd * 2, // Rough estimate
            last_updated: Date.now(),
          },
          timestamp: Date.now(),
          meta: dexResponse.meta,
        };
      }

      throw new Error('Failed to fetch token price from all sources');
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  async getDEXPairData(tokenAddress: string, chain: string = 'ethereum'): Promise<APIResponse<DexPair>> {
    try {
      // Try DexTools first
      const dextoolsResponse = await this.dextoolsAPI.request<any>({
        method: 'GET',
        url: `/pair/${chain}/${tokenAddress}`,
      });

      if (dextoolsResponse.success && dextoolsResponse.data) {
        return {
          success: true,
          data: this.formatDexToolsPair(dextoolsResponse.data),
          timestamp: Date.now(),
          meta: dextoolsResponse.meta,
        };
      }

      // Fallback to DexScreener
      const dexscreenerResponse = await this.dexscreenerAPI.request<any>({
        method: 'GET',
        url: `/pairs/${chain}/${tokenAddress}`,
      });

      if (dexscreenerResponse.success && dexscreenerResponse.data?.pairs?.[0]) {
        return {
          success: true,
          data: this.formatDexScreenerPair(dexscreenerResponse.data.pairs[0]),
          timestamp: Date.now(),
          meta: dexscreenerResponse.meta,
        };
      }

      throw new Error('Failed to fetch DEX pair data');
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  private formatDexToolsPair(data: any): DexPair {
    return {
      address: data.pairAddress,
      chain: data.chain,
      dex: data.dex,
      token0: {
        address: data.token0.address,
        symbol: data.token0.symbol,
        decimals: data.token0.decimals,
      },
      token1: {
        address: data.token1.address,
        symbol: data.token1.symbol,
        decimals: data.token1.decimals,
      },
      liquidity_usd: parseFloat(data.liquidity.usd || '0'),
      volume_24h: parseFloat(data.volume24h.usd || '0'),
    };
  }

  private formatDexScreenerPair(data: any): DexPair {
    return {
      address: data.pairAddress,
      chain: data.chainId,
      dex: data.dexId,
      token0: {
        address: data.baseToken.address,
        symbol: data.baseToken.symbol,
        decimals: data.baseToken.decimals,
      },
      token1: {
        address: data.quoteToken.address,
        symbol: data.quoteToken.symbol,
        decimals: data.quoteToken.decimals,
      },
      liquidity_usd: parseFloat(data.liquidity?.usd || '0'),
      volume_24h: parseFloat(data.volume?.h24 || '0'),
    };
  }

  private calculateTokenPrice(pair: DexPair): number {
    // This is a simplified calculation
    // In a real implementation, you would:
    // 1. Get the reserves of both tokens
    // 2. Calculate the price based on the ratio and decimals
    // 3. Convert to USD if one of the tokens is a stablecoin
    return pair.liquidity_usd / Math.pow(10, pair.token0.decimals);
  }
}

export const marketDataService = new MarketDataService();