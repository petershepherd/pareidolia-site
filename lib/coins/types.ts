// lib/coins/types.ts

export type PareidoliaPatternType = 
  | 'faces'
  | 'animals' 
  | 'objects'
  | 'landscapes'
  | 'abstract'
  | 'mixed';

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
  
  // Market data
  price?: number;
  marketCap?: number;
  volume24h?: number;
  liquidity?: number;
  holders?: number;
  change24h?: number; // Percentage change
  
  // Pareidolia-specific metrics
  pareidoliaScore?: number; // 0-100 score
  patternType?: PareidoliaPatternType;
  visualSimilarity?: number; // 0-100 similarity score
  patternStrength?: number; // 0-100 strength of pattern recognition
  
  // Social metrics  
  twitterFollowers?: number;
  telegramMembers?: number;
  
  // Launch data
  creatorWallet?: string;
  launchPrice?: number;
  
  // Additional trading metrics
  ath?: number; // All time high
  atl?: number; // All time low
  fdv?: number; // Fully diluted valuation
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