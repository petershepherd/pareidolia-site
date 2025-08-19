// app/api/coins/sync/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { syncCoinMarketData, getSyncStatus } from '@/lib/coins/sync';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { coinIds, forceSync } = body;

    console.log('Starting manual coin sync...', { coinIds, forceSync });

    const result = await syncCoinMarketData({
      coinIds: Array.isArray(coinIds) ? coinIds : undefined,
      forceSync: Boolean(forceSync)
    });

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: {
        syncedCoins: result.syncedCoins,
        failedCoins: result.failedCoins,
        errors: result.errors,
        timestamp: new Date().toISOString()
      }
    }, {
      status: result.success ? 200 : 500
    });

  } catch (error: any) {
    console.error('Error during coin sync:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Sync failed', 
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const status = getSyncStatus();
    
    return NextResponse.json({
      success: true,
      data: {
        ...status,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error getting sync status:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get sync status', 
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}