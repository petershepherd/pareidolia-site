// lib/dexscreener/types.ts

export type DexScreenerPair = {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd?: string;
  txns: {
    m5: {
      buys: number;
      sells: number;
    };
    h1: {
      buys: number;
      sells: number;
    };
    h6: {
      buys: number;
      sells: number;
    };
    h24: {
      buys: number;
      sells: number;
    };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity?: {
    usd?: number;
    base?: number;
    quote?: number;
  };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
};

export type DexScreenerResponse = {
  schemaVersion: string;
  pairs: DexScreenerPair[] | null;
};

export type MarketData = {
  price: number | null;
  volume24h: number | null;
  liquidity: number | null;
  marketCap: number | null;
  priceChange24h: number | null;
  lastSyncAt: string;
};

export type SyncResult = {
  success: boolean;
  error?: string;
  data?: MarketData;
};