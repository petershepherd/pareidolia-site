// app/api/coins/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { filterCoins } from '@/lib/coins/store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    
    const coins = await filterCoins(search, status);
    
    return NextResponse.json({ coins });
  } catch (error: any) {
    console.error('Error fetching coins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coins', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}