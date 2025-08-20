// lib/coins/types.ts

export type Coin = {
  id: string;
  symbol: string;
  name: string;
  description?: string;
  contractAddress: string;
  chain: 'SOL'; // Only Solana supported initially
  createdAt: string; // ISO timestamp
  website?: string;
  twitter?: string;
  telegram?: string;
  dexUrl?: string;
  explorerUrl?: string;
  // Market data fields
  price?: number | null;
  volume24h?: number | null;
  liquidity?: number | null;
  marketCap?: number | null;
  priceChange24h?: number | null;
  priceChangeLifetime?: number | null; // Lifetime price change percentage
  lastSyncAt?: string | null;
  holders?: number;
};

export type BurnEvent = {
  id: string;
  coinId: string;
  amount: number;
  txHash: string;
  timestamp: string; // ISO
  description?: string;
};

export type CoinStatus = 'NEW' | 'EARLY' | 'ESTABLISHED';

export type CoinsData = {
  coins: Coin[];
  burnEvents: BurnEvent[];
};

export type CoinWithStatus = Coin & {
  status: CoinStatus;
};
