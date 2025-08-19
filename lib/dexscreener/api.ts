// lib/dexscreener/api.ts

import { DexScreenerResponse, MarketData, SyncResult } from './types';
import { dexscreenerConfig } from '../config/dexscreener';
import marketDataCache from '../cache/market-data';

const { apiBase, userAgent, maxRetries, retryDelayMs, requestTimeoutMs, batchSize, batchDelayMs } = dexscreenerConfig;

async function fetchWithRetry(url: string, options: RequestInit, retries = maxRetries): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(requestTimeoutMs),
      });

      if (response.ok) {
        return response;
      }

      // If we got rate limited (429) or server error (5xx), retry
      if ((response.status === 429 || response.status >= 500) && attempt < retries) {
        const delay = retryDelayMs * Math.pow(2, attempt - 1); // Exponential backoff
        console.warn(`DexScreener API attempt ${attempt} failed with status ${response.status}, retrying in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // For other errors, throw immediately
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      
      // Retry on network errors
      const delay = retryDelayMs * Math.pow(2, attempt - 1);
      console.warn(`DexScreener API attempt ${attempt} failed:`, error, `retrying in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
}

export async function fetchTokenMarketData(contractAddress: string): Promise<SyncResult> {
  try {
    // Check cache first
    const cacheKey = `market-data:${contractAddress}`;
    const cachedData = marketDataCache.get(cacheKey);
    
    if (cachedData) {
      console.log(`Using cached market data for token: ${contractAddress}`);
      return {
        success: true,
        data: cachedData
      };
    }

    const url = `${apiBase}/tokens/${contractAddress}`;
    
    console.log(`Fetching market data for token: ${contractAddress}`);
    
    const response = await fetchWithRetry(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': userAgent
      }
    });

    const data: DexScreenerResponse = await response.json();
    
    if (!data.pairs || data.pairs.length === 0) {
      return {
        success: false,
        error: 'No trading pairs found for this token'
      };
    }

    // Find the best pair (highest volume or liquidity)
    const bestPair = data.pairs.reduce((best, current) => {
      const bestLiquidity = best.liquidity?.usd || 0;
      const currentLiquidity = current.liquidity?.usd || 0;
      const bestVolume = best.volume?.h24 || 0;
      const currentVolume = current.volume?.h24 || 0;
      
      // Prefer pair with higher liquidity, then volume
      if (currentLiquidity > bestLiquidity) return current;
      if (currentLiquidity === bestLiquidity && currentVolume > bestVolume) return current;
      return best;
    });

    const marketData: MarketData = {
      price: bestPair.priceUsd ? parseFloat(bestPair.priceUsd) : null,
      volume24h: bestPair.volume?.h24 || null,
      liquidity: bestPair.liquidity?.usd || null,
      marketCap: bestPair.marketCap || bestPair.fdv || null,
      priceChange24h: bestPair.priceChange?.h24 || null,
      lastSyncAt: new Date().toISOString()
    };

    // Cache the result for 3 minutes
    marketDataCache.set(cacheKey, marketData, 3 * 60 * 1000);

    console.log(`Successfully fetched market data for ${contractAddress}:`, marketData);

    return {
      success: true,
      data: marketData
    };

  } catch (error: any) {
    console.error(`Failed to fetch market data for ${contractAddress}:`, error);
    
    return {
      success: false,
      error: error.message || 'Failed to fetch market data'
    };
  }
}

export async function fetchMultipleTokensMarketData(contractAddresses: string[]): Promise<Record<string, SyncResult>> {
  const results: Record<string, SyncResult> = {};
  
  // Process tokens in batches to respect rate limits
  for (let i = 0; i < contractAddresses.length; i += batchSize) {
    const batch = contractAddresses.slice(i, i + batchSize);
    
    // Process batch concurrently
    const batchPromises = batch.map(async (address) => {
      const result = await fetchTokenMarketData(address);
      results[address] = result;
    });
    
    await Promise.all(batchPromises);
    
    // Delay between batches (except for the last batch)
    if (i + batchSize < contractAddresses.length) {
      await new Promise(resolve => setTimeout(resolve, batchDelayMs));
    }
  }
  
  return results;
}

// Health check function to verify API availability
export async function checkDexScreenerHealth(): Promise<boolean> {
  try {
    const response = await fetchWithRetry(`${apiBase}/tokens/So11111111111111111111111111111111111111112`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': userAgent
      }
    }, 1); // Only one retry for health check
    
    return response.ok;
  } catch (error) {
    console.error('DexScreener health check failed:', error);
    return false;
  }
}