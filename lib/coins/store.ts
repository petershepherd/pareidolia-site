// lib/coins/store.ts

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { CoinsData, Coin, BurnEvent, CoinWithStatus } from './types';
import { deriveCoinStatus } from './badges';

const COINS_FILE_PATH = path.join(process.cwd(), 'data', 'coins.json');

// Chain writes to avoid race conditions
let writePromise: Promise<void> = Promise.resolve();

async function safeReadCoinsFile(): Promise<CoinsData> {
  try {
    const content = await fs.readFile(COINS_FILE_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { coins: [], burnEvents: [] };
  }
}

async function safeWriteCoinsFile(data: CoinsData): Promise<void> {
  const content = JSON.stringify(data, null, 2);
  await fs.mkdir(path.dirname(COINS_FILE_PATH), { recursive: true });
  await fs.writeFile(COINS_FILE_PATH, content, 'utf-8');
}

export async function readCoinsData(): Promise<CoinsData> {
  return safeReadCoinsFile();
}

export async function writeCoinsData(data: CoinsData): Promise<void> {
  writePromise = writePromise.then(() => safeWriteCoinsFile(data));
  return writePromise;
}

export async function addCoin(coin: Coin): Promise<void> {
  const data = await readCoinsData();
  data.coins.push(coin);
  await writeCoinsData(data);
}

export async function addBurnEvent(burnEvent: BurnEvent): Promise<void> {
  const data = await readCoinsData();
  data.burnEvents.push(burnEvent);
  await writeCoinsData(data);
}

export async function getCoinById(id: string): Promise<Coin | null> {
  const data = await readCoinsData();
  return data.coins.find(coin => coin.id === id) || null;
}

export async function getCoinsWithStatus(): Promise<CoinWithStatus[]> {
  const data = await readCoinsData();
  return data.coins.map(coin => ({
    ...coin,
    status: deriveCoinStatus(coin)
  }));
}

export async function filterCoins(
  search?: string, 
  status?: string
): Promise<CoinWithStatus[]> {
  const coins = await getCoinsWithStatus();
  
  let filtered = coins;
  
  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(coin => 
      coin.name.toLowerCase().includes(query) ||
      coin.symbol.toLowerCase().includes(query) ||
      coin.description?.toLowerCase().includes(query)
    );
  }
  
  if (status && status !== 'ALL') {
    filtered = filtered.filter(coin => coin.status === status);
  }
  
  return filtered;
}