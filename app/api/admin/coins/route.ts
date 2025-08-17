// app/api/admin/coins/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { addCoin } from '@/lib/coins/store';
import { Coin } from '@/lib/coins/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check for ADMIN_TOKEN authorization
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.ADMIN_TOKEN;
    
    if (!expectedToken) {
      return NextResponse.json(
        { error: 'Server configuration error: ADMIN_TOKEN not set' },
        { status: 500 }
      );
    }
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid authorization header' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7); // Remove "Bearer " prefix
    if (token !== expectedToken) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Basic validation
    if (!body.id || !body.symbol || !body.name || !body.contractAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: id, symbol, name, contractAddress' },
        { status: 400 }
      );
    }
    
    const coin: Coin = {
      id: body.id,
      symbol: body.symbol,
      name: body.name,
      description: body.description || undefined,
      contractAddress: body.contractAddress,
      chain: 'SOL', // Fixed to SOL
      createdAt: new Date().toISOString(),
      website: body.website || undefined,
      twitter: body.twitter || undefined,
      telegram: body.telegram || undefined,
      dexUrl: body.dexUrl || undefined,
      explorerUrl: body.explorerUrl || undefined,
      // Future metrics (optional for now)
      price: body.price || undefined,
      volume24h: body.volume24h || undefined,
      liquidity: body.liquidity || undefined,
      holders: body.holders || undefined,
    };
    
    await addCoin(coin);
    
    return NextResponse.json({ 
      success: true, 
      coin,
      message: 'Coin added successfully' 
    });
    
  } catch (error: any) {
    console.error('Error adding coin:', error);
    return NextResponse.json(
      { error: 'Failed to add coin', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}