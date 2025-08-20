// lib/utils/formatting.ts

export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return 'TBA';
  
  if (price < 0.000001) {
    return `$${price.toExponential(2)}`;
  } else if (price < 0.01) {
    return `$${price.toFixed(6)}`;
  } else if (price < 1) {
    return `$${price.toFixed(4)}`;
  } else {
    return `$${price.toFixed(2)}`;
  }
}

export function formatVolume(volume: number | null): string {
  if (volume === null || volume === undefined) return 'TBA';
  
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(2)}M`;
  } else if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(1)}K`;
  } else {
    return `$${volume.toFixed(0)}`;
  }
}

export function formatMarketCap(marketCap: number | null): string {
  if (marketCap === null || marketCap === undefined) return 'TBA';
  
  if (marketCap >= 1_000_000_000) {
    return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
  } else if (marketCap >= 1_000_000) {
    return `$${(marketCap / 1_000_000).toFixed(2)}M`;
  } else if (marketCap >= 1_000) {
    return `$${(marketCap / 1_000).toFixed(1)}K`;
  } else {
    return `$${marketCap.toFixed(0)}`;
  }
}

export function formatPriceChange(priceChange: number | null): {
  formatted: string;
  isPositive: boolean;
  isNegative: boolean;
} {
  if (priceChange === null || priceChange === undefined) {
    return {
      formatted: 'TBA',
      isPositive: false,
      isNegative: false
    };
  }
  
  const isPositive = priceChange > 0;
  const isNegative = priceChange < 0;
  const formatted = `${isPositive ? '+' : ''}${priceChange.toFixed(2)}%`;
  
  return {
    formatted,
    isPositive,
    isNegative
  };
}

export function formatLiquidity(liquidity: number | null): string {
  return formatVolume(liquidity); // Same formatting as volume
}
export function formatHolders(holders: number | null): string {
  if (holders === null || holders === undefined) return 'TBA';
  
  if (holders >= 1_000_000) {
    return `${(holders / 1_000_000).toFixed(2)}M`;
  } else if (holders >= 1_000) {
    return `${(holders / 1_000).toFixed(1)}K`;
  } else {
    return `${holders.toFixed(0)}`;
  }
}

export function formatTimestamp(timestamp: string | null): string {
  if (!timestamp) return 'Never';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 24 * 60) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInMinutes / (24 * 60));
    return `${days}d ago`;
  }
}
