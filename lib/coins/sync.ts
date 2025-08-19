// lib/coins/sync.ts

import { readCoinsData, writeCoinsData, getCoinById } from './store';
import { fetchTokenMarketData, fetchMultipleTokensMarketData, checkDexScreenerHealth } from '../dexscreener/api';
import { Coin } from './types';
import { SyncResult } from '../dexscreener/types';

export type SyncStatus = {
  isRunning: boolean;
  lastSyncAt: string | null;
  nextSyncAt: string | null;
  lastError: string | null;
  totalCoins: number;
  syncedCoins: number;
  failedCoins: number;
};

export type SyncOptions = {
  coinIds?: string[]; // Sync specific coins, or all if undefined
  forceSync?: boolean; // Skip rate limiting checks
};

// Global sync status
let currentSyncStatus: SyncStatus = {
  isRunning: false,
  lastSyncAt: null,
  nextSyncAt: null,
  lastError: null,
  totalCoins: 0,
  syncedCoins: 0,
  failedCoins: 0
};

// Minimum time between syncs for a coin (5 minutes)
const MIN_SYNC_INTERVAL_MS = 5 * 60 * 1000;

export function getSyncStatus(): SyncStatus {
  return { ...currentSyncStatus };
}

function updateSyncStatus(updates: Partial<SyncStatus>) {
  currentSyncStatus = { ...currentSyncStatus, ...updates };
}

export async function syncCoinMarketData(options: SyncOptions = {}): Promise<{
  success: boolean;
  message: string;
  syncedCoins: number;
  failedCoins: number;
  errors: string[];
}> {
  if (currentSyncStatus.isRunning) {
    return {
      success: false,
      message: 'Sync is already running',
      syncedCoins: 0,
      failedCoins: 0,
      errors: []
    };
  }

  updateSyncStatus({
    isRunning: true,
    lastError: null,
    syncedCoins: 0,
    failedCoins: 0
  });

  const errors: string[] = [];
  let syncedCount = 0;
  let failedCount = 0;

  try {
    // Check API health first
    const isHealthy = await checkDexScreenerHealth();
    if (!isHealthy) {
      throw new Error('DexScreener API is currently unavailable');
    }

    // Get coins data
    const data = await readCoinsData();
    let coinsToSync = data.coins;

    // Filter by specific coin IDs if provided
    if (options.coinIds && options.coinIds.length > 0) {
      coinsToSync = data.coins.filter(coin => options.coinIds!.includes(coin.id));
    }

    // Filter out recently synced coins unless force sync is enabled
    if (!options.forceSync) {
      const now = Date.now();
      coinsToSync = coinsToSync.filter(coin => {
        if (!coin.lastSyncAt) return true;
        const lastSync = new Date(coin.lastSyncAt).getTime();
        return (now - lastSync) >= MIN_SYNC_INTERVAL_MS;
      });
    }

    updateSyncStatus({
      totalCoins: coinsToSync.length
    });

    if (coinsToSync.length === 0) {
      return {
        success: true,
        message: 'No coins need syncing',
        syncedCoins: 0,
        failedCoins: 0,
        errors: []
      };
    }

    console.log(`Starting sync for ${coinsToSync.length} coins...`);

    // Extract contract addresses
    const contractAddresses = coinsToSync.map(coin => coin.contractAddress);

    // Fetch market data for all coins
    const marketDataResults = await fetchMultipleTokensMarketData(contractAddresses);

    // Update each coin with the fetched data
    for (const coin of coinsToSync) {
      try {
        const result = marketDataResults[coin.contractAddress];
        
        if (result.success && result.data) {
          // Find and update the coin in the data
          const coinIndex = data.coins.findIndex(c => c.id === coin.id);
          if (coinIndex !== -1) {
            data.coins[coinIndex] = {
              ...data.coins[coinIndex],
              price: result.data.price,
              volume24h: result.data.volume24h,
              liquidity: result.data.liquidity,
              marketCap: result.data.marketCap,
              priceChange24h: result.data.priceChange24h,
              lastSyncAt: result.data.lastSyncAt
            };
            
            syncedCount++;
            console.log(`Successfully synced market data for ${coin.symbol}`);
          }
        } else {
          failedCount++;
          const errorMsg = `Failed to sync ${coin.symbol}: ${result.error}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      } catch (error: any) {
        failedCount++;
        const errorMsg = `Error syncing ${coin.symbol}: ${error.message}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    // Save updated data
    await writeCoinsData(data);

    const success = syncedCount > 0 || failedCount === 0;
    const message = `Sync completed: ${syncedCount} synced, ${failedCount} failed`;

    updateSyncStatus({
      isRunning: false,
      lastSyncAt: new Date().toISOString(),
      lastError: errors.length > 0 ? errors[0] : null,
      syncedCoins: syncedCount,
      failedCoins: failedCount
    });

    console.log(message);

    return {
      success,
      message,
      syncedCoins: syncedCount,
      failedCoins: failedCount,
      errors
    };

  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error during sync';
    console.error('Sync process failed:', error);
    
    updateSyncStatus({
      isRunning: false,
      lastError: errorMessage,
      failedCoins: failedCount
    });

    return {
      success: false,
      message: `Sync failed: ${errorMessage}`,
      syncedCoins: syncedCount,
      failedCoins: failedCount,
      errors: [errorMessage]
    };
  }
}

export async function syncSingleCoin(coinId: string): Promise<SyncResult> {
  try {
    const coin = await getCoinById(coinId);
    if (!coin) {
      return {
        success: false,
        error: 'Coin not found'
      };
    }

    const result = await fetchTokenMarketData(coin.contractAddress);
    
    if (result.success && result.data) {
      // Update the coin with new market data
      const data = await readCoinsData();
      const coinIndex = data.coins.findIndex(c => c.id === coinId);
      
      if (coinIndex !== -1) {
        data.coins[coinIndex] = {
          ...data.coins[coinIndex],
          price: result.data.price,
          volume24h: result.data.volume24h,
          liquidity: result.data.liquidity,
          marketCap: result.data.marketCap,
          priceChange24h: result.data.priceChange24h,
          lastSyncAt: result.data.lastSyncAt
        };
        
        await writeCoinsData(data);
      }
    }

    return result;
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to sync coin'
    };
  }
}

// Schedule next sync (this would be called by a cron job or background process)
export function getNextSyncTime(): Date {
  const now = new Date();
  const nextSync = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
  return nextSync;
}

export function shouldSync(coin: Coin): boolean {
  if (!coin.lastSyncAt) return true;
  
  const now = Date.now();
  const lastSync = new Date(coin.lastSyncAt).getTime();
  return (now - lastSync) >= MIN_SYNC_INTERVAL_MS;
}