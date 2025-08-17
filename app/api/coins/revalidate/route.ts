// app/api/coins/revalidate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // This is a placeholder endpoint for future on-chain sync job triggers
    // For now, it just revalidates the coins data
    
    revalidateTag('coins');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Coins data revalidated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Error during revalidation:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}