// lib/coins/badges.ts

import { Coin, CoinStatus } from './types';

export function deriveCoinStatus(coin: Coin): CoinStatus {
  const now = new Date();
  const created = new Date(coin.createdAt);
  const ageInHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  
  if (ageInHours < 24) {
    return 'NEW';
  } else if (ageInHours < 24 * 7) {
    return 'EARLY';
  } else {
    return 'ESTABLISHED';
  }
}

export function getCoinAgeInDays(coin: Coin): number {
  const now = new Date();
  const created = new Date(coin.createdAt);
  const ageInDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, ageInDays);
}

export function getStatusBadgeClassName(status: CoinStatus): string {
  switch (status) {
    case 'NEW':
      return 'bg-red-500/20 text-red-400 border-red-500/30'; // Red for new/hot
    case 'EARLY':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'; // Blue for early
    case 'ESTABLISHED':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'; // Gray for established
    default:
      return 'bg-white/10 text-white border-white/20';
  }
}

export function getStatusLabel(status: CoinStatus): string {
  switch (status) {
    case 'NEW':
      return 'NEW';
    case 'EARLY':  
      return 'EARLY';
    case 'ESTABLISHED':
      return 'ESTABLISHED';
    default:
      return '';
  }
}
