// lib/config/dexscreener.ts

export const dexscreenerConfig = {
  // Sync intervals in minutes
  syncIntervalMinutes: parseInt(process.env.DEXSCREENER_SYNC_INTERVAL_MINUTES || '10'),
  minSyncIntervalMinutes: parseInt(process.env.DEXSCREENER_MIN_SYNC_INTERVAL_MINUTES || '5'),
  
  // Feature flags
  enableAutoSync: process.env.ENABLE_AUTO_SYNC !== 'false',
  
  // Rate limiting
  maxRetries: parseInt(process.env.DEXSCREENER_MAX_RETRIES || '3'),
  retryDelayMs: parseInt(process.env.DEXSCREENER_RETRY_DELAY_MS || '1000'),
  requestTimeoutMs: parseInt(process.env.DEXSCREENER_REQUEST_TIMEOUT_MS || '10000'),
  
  // API configuration
  apiBase: 'https://api.dexscreener.com/latest/dex',
  userAgent: 'Pareidolia-Site/1.0',
  
  // Batch processing
  batchSize: 5,
  batchDelayMs: 1000
};

export function validateDexscreenerConfig(): string[] {
  const errors: string[] = [];
  
  if (dexscreenerConfig.syncIntervalMinutes < 1) {
    errors.push('DEXSCREENER_SYNC_INTERVAL_MINUTES must be at least 1');
  }
  
  if (dexscreenerConfig.minSyncIntervalMinutes < 1) {
    errors.push('DEXSCREENER_MIN_SYNC_INTERVAL_MINUTES must be at least 1');
  }
  
  if (dexscreenerConfig.maxRetries < 1) {
    errors.push('DEXSCREENER_MAX_RETRIES must be at least 1');
  }
  
  if (dexscreenerConfig.retryDelayMs < 100) {
    errors.push('DEXSCREENER_RETRY_DELAY_MS must be at least 100ms');
  }
  
  if (dexscreenerConfig.requestTimeoutMs < 1000) {
    errors.push('DEXSCREENER_REQUEST_TIMEOUT_MS must be at least 1000ms');
  }
  
  return errors;
}