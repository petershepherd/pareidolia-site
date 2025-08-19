// lib/coins/utils.ts

import { Coin, CoinWithStatus, PareidoliaPatternType } from './types';

// Number formatting utilities
export function formatPrice(price: number | undefined): string {
  if (price === undefined) return 'TBA';
  if (price < 0.000001) return `$${price.toExponential(2)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  if (price < 100) return `$${price.toFixed(2)}`;
  return `$${price.toLocaleString()}`;
}

export function formatMarketCap(marketCap: number | undefined): string {
  if (marketCap === undefined) return 'TBA';
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
  if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`;
  return `$${marketCap.toFixed(0)}`;
}

export function formatVolume(volume: number | undefined): string {
  if (volume === undefined) return 'TBA';
  if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
  if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
  return `$${volume.toFixed(0)}`;
}

export function formatHolders(holders: number | undefined): string {
  if (holders === undefined) return 'TBA';
  if (holders >= 1e6) return `${(holders / 1e6).toFixed(2)}M`;
  if (holders >= 1e3) return `${(holders / 1e3).toFixed(1)}K`;
  return holders.toLocaleString();
}

export function formatPercentage(percentage: number | undefined, showPlus = true): string {
  if (percentage === undefined) return 'TBA';
  const sign = percentage > 0 && showPlus ? '+' : '';
  return `${sign}${percentage.toFixed(2)}%`;
}

export function formatScore(score: number | undefined): string {
  if (score === undefined) return 'TBA';
  return `${score.toFixed(0)}/100`;
}

export function formatFollowers(followers: number | undefined): string {
  if (followers === undefined) return 'TBA';
  if (followers >= 1e6) return `${(followers / 1e6).toFixed(1)}M`;
  if (followers >= 1e3) return `${(followers / 1e3).toFixed(1)}K`;
  return followers.toLocaleString();
}

// Date formatting utilities
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffHours < 1) {
    return `${Math.floor(diffMs / (1000 * 60))}m ago`;
  } else if (diffHours < 24) {
    return `${Math.floor(diffHours)}h ago`;
  } else if (diffDays < 7) {
    return `${Math.floor(diffDays)}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function formatLaunchDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Pattern type utilities
export function getPatternTypeLabel(patternType: PareidoliaPatternType | undefined): string {
  if (!patternType) return 'Unknown';
  
  const labels: Record<PareidoliaPatternType, string> = {
    faces: 'Faces',
    animals: 'Animals',
    objects: 'Objects', 
    landscapes: 'Landscapes',
    abstract: 'Abstract',
    mixed: 'Mixed Patterns'
  };
  
  return labels[patternType] || 'Unknown';
}

export function getPatternTypeColor(patternType: PareidoliaPatternType | undefined): string {
  if (!patternType) return 'text-neutral-400';
  
  const colors: Record<PareidoliaPatternType, string> = {
    faces: 'text-pink-400',
    animals: 'text-green-400',
    objects: 'text-blue-400',
    landscapes: 'text-emerald-400',
    abstract: 'text-purple-400',
    mixed: 'text-amber-400'
  };
  
  return colors[patternType] || 'text-neutral-400';
}

export function getPatternTypeBadgeColor(patternType: PareidoliaPatternType | undefined): string {
  if (!patternType) return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
  
  const colors: Record<PareidoliaPatternType, string> = {
    faces: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    animals: 'bg-green-500/20 text-green-400 border-green-500/30',
    objects: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    landscapes: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    abstract: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    mixed: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  };
  
  return colors[patternType] || 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
}

// Performance indicators
export function getPerformanceColor(change24h: number | undefined): string {
  if (change24h === undefined) return 'text-neutral-400';
  if (change24h > 10) return 'text-green-400';
  if (change24h > 0) return 'text-emerald-400';
  if (change24h > -10) return 'text-yellow-400';
  return 'text-red-400';
}

export function getScoreColor(score: number | undefined): string {
  if (score === undefined) return 'text-neutral-400';
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

// Sorting utilities
export type SortOption = 
  | 'marketCap'
  | 'pareidoliaScore' 
  | 'change24h'
  | 'launchDate'
  | 'volume24h'
  | 'holders'
  | 'name';

export function sortCoins(coins: CoinWithStatus[], sortBy: SortOption, direction: 'asc' | 'desc' = 'desc'): CoinWithStatus[] {
  const sorted = [...coins].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case 'marketCap':
        aValue = a.marketCap ?? 0;
        bValue = b.marketCap ?? 0;
        break;
      case 'pareidoliaScore':
        aValue = a.pareidoliaScore ?? 0;
        bValue = b.pareidoliaScore ?? 0;
        break;
      case 'change24h':
        aValue = a.change24h ?? -999;
        bValue = b.change24h ?? -999;
        break;
      case 'launchDate':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'volume24h':
        aValue = a.volume24h ?? 0;
        bValue = b.volume24h ?? 0;
        break;
      case 'holders':
        aValue = a.holders ?? 0;
        bValue = b.holders ?? 0;
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
}

// Filtering utilities
export interface FilterOptions {
  patternType?: PareidoliaPatternType;
  minMarketCap?: number;
  maxMarketCap?: number;
  minPareidoliaScore?: number;
  maxPareidoliaScore?: number;
}

export function filterCoinsByOptions(coins: CoinWithStatus[], options: FilterOptions): CoinWithStatus[] {
  return coins.filter(coin => {
    // Pattern type filter
    if (options.patternType && coin.patternType !== options.patternType) {
      return false;
    }
    
    // Market cap filters
    if (options.minMarketCap && (coin.marketCap ?? 0) < options.minMarketCap) {
      return false;
    }
    if (options.maxMarketCap && (coin.marketCap ?? Infinity) > options.maxMarketCap) {
      return false;
    }
    
    // Pareidolia score filters
    if (options.minPareidoliaScore && (coin.pareidoliaScore ?? 0) < options.minPareidoliaScore) {
      return false;
    }
    if (options.maxPareidoliaScore && (coin.pareidoliaScore ?? 100) > options.maxPareidoliaScore) {
      return false;
    }
    
    return true;
  });
}

// Derived metrics calculations
export function calculatePerformanceScore(coin: Coin): number {
  let score = 50; // Base score
  
  // Market cap weight (0-25 points)
  if (coin.marketCap) {
    if (coin.marketCap > 100e6) score += 25;
    else if (coin.marketCap > 10e6) score += 20;
    else if (coin.marketCap > 1e6) score += 15;
    else if (coin.marketCap > 100e3) score += 10;
    else score += 5;
  }
  
  // 24h change weight (0-20 points)
  if (coin.change24h !== undefined) {
    if (coin.change24h > 50) score += 20;
    else if (coin.change24h > 20) score += 15;
    else if (coin.change24h > 0) score += 10;
    else if (coin.change24h > -20) score += 5;
    else score -= 10;
  }
  
  // Volume weight (0-15 points)  
  if (coin.volume24h) {
    if (coin.volume24h > 1e6) score += 15;
    else if (coin.volume24h > 100e3) score += 10;
    else if (coin.volume24h > 10e3) score += 5;
  }
  
  // Holder count weight (0-10 points)
  if (coin.holders) {
    if (coin.holders > 10000) score += 10;
    else if (coin.holders > 1000) score += 7;
    else if (coin.holders > 100) score += 5;
    else if (coin.holders > 10) score += 2;
  }
  
  return Math.min(Math.max(score, 0), 100);
}

export function calculateTrendingScore(coin: Coin): number {
  const now = new Date();
  const created = new Date(coin.createdAt);
  const ageInHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  
  let score = 0;
  
  // Recency bonus (newer = higher trending potential)
  if (ageInHours < 24) score += 30;
  else if (ageInHours < 72) score += 20;
  else if (ageInHours < 168) score += 10; // 1 week
  
  // Performance bonus
  if (coin.change24h !== undefined && coin.change24h > 0) {
    score += Math.min(coin.change24h / 2, 25);
  }
  
  // Volume bonus
  if (coin.volume24h) {
    if (coin.volume24h > 1e6) score += 20;
    else if (coin.volume24h > 100e3) score += 15;
    else if (coin.volume24h > 10e3) score += 10;
  }
  
  // Pareidolia score bonus
  if (coin.pareidoliaScore) {
    score += coin.pareidoliaScore * 0.25;
  }
  
  return Math.min(score, 100);
}