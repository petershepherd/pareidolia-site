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
  // Future metrics (placeholders for now)
  price?: number;
  volume24h?: number;
  liquidity?: number;
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