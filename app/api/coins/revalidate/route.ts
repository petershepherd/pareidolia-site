// app/api/coins/revalidate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { syncCoinMarketData } from '@/lib/coins/sync';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // This endpoint now also triggers market data sync in addition to revalidation
    
    // First, revalidate the cache
    revalidateTag('coins');
    
    // Then sync market data for all coins
    const syncResult = await syncCoinMarketData({ forceSync: false });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Coins data revalidated and synced successfully',
      syncResult: {
        synced: syncResult.syncedCoins,
        failed: syncResult.failedCoins,
        errors: syncResult.errors.length > 0 ? syncResult.errors : undefined
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Error during revalidation and sync:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate and sync', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}