// app/api/coins/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getCoinById } from '@/lib/coins/store';
import { deriveCoinStatus } from '@/lib/coins/badges';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const coin = await getCoinById(id);
    
    if (!coin) {
      return NextResponse.json(
        { error: 'Coin not found' },
        { status: 404 }
      );
    }
    
    const coinWithStatus = {
      ...coin,
      status: deriveCoinStatus(coin)
    };
    
    return NextResponse.json({ coin: coinWithStatus });
  } catch (error: any) {
    console.error('Error fetching coin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coin', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}