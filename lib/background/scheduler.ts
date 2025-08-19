// lib/background/scheduler.ts

import { syncCoinMarketData, getSyncStatus } from '../coins/sync';
import { dexscreenerConfig } from '../config/dexscreener';

class BackgroundScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isInitialized = false;

  start() {
    if (!dexscreenerConfig.enableAutoSync) {
      console.log('Auto-sync is disabled via ENABLE_AUTO_SYNC environment variable');
      return;
    }

    if (this.intervalId) {
      console.warn('Background scheduler is already running');
      return;
    }

    const intervalMs = dexscreenerConfig.syncIntervalMinutes * 60 * 1000;
    
    console.log(`Starting background sync scheduler (every ${dexscreenerConfig.syncIntervalMinutes} minutes)`);
    
    // Run initial sync after a short delay (30 seconds)
    setTimeout(() => {
      this.runSyncTask();
    }, 30 * 1000);

    // Then run on interval
    this.intervalId = setInterval(() => {
      this.runSyncTask();
    }, intervalMs);

    this.isInitialized = true;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Background sync scheduler stopped');
    }
  }

  private async runSyncTask() {
    try {
      console.log('Background sync task starting...');
      
      // Check if sync is already running
      const status = getSyncStatus();
      if (status.isRunning) {
        console.log('Sync already running, skipping background sync');
        return;
      }

      const result = await syncCoinMarketData({
        forceSync: false // Only sync coins that need updating
      });

      if (result.success) {
        console.log(`Background sync completed: ${result.syncedCoins} synced, ${result.failedCoins} failed`);
      } else {
        console.error('Background sync failed:', result.message);
      }
    } catch (error) {
      console.error('Background sync task error:', error);
    }
  }

  isRunning(): boolean {
    return this.intervalId !== null;
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isRunning: this.isRunning(),
      autoSyncEnabled: dexscreenerConfig.enableAutoSync,
      syncIntervalMinutes: dexscreenerConfig.syncIntervalMinutes
    };
  }
}

// Global singleton instance
let schedulerInstance: BackgroundScheduler | null = null;

export function getScheduler(): BackgroundScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new BackgroundScheduler();
  }
  return schedulerInstance;
}

// Auto-start the scheduler in production environments
// This will be called when the module is imported
if (typeof window === 'undefined') { // Server-side only
  const scheduler = getScheduler();
  
  // Start scheduler after a delay to ensure everything is initialized
  setTimeout(() => {
    scheduler.start();
  }, 5000); // 5 second delay
}