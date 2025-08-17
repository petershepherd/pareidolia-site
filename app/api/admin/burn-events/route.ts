// app/api/admin/burn-events/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { addBurnEvent } from '@/lib/coins/store';
import { BurnEvent } from '@/lib/coins/types';

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
    if (!body.id || !body.coinId || !body.amount || !body.txHash) {
      return NextResponse.json(
        { error: 'Missing required fields: id, coinId, amount, txHash' },
        { status: 400 }
      );
    }
    
    const burnEvent: BurnEvent = {
      id: body.id,
      coinId: body.coinId,
      amount: Number(body.amount),
      txHash: body.txHash,
      timestamp: new Date().toISOString(),
      description: body.description || undefined,
    };
    
    await addBurnEvent(burnEvent);
    
    return NextResponse.json({ 
      success: true, 
      burnEvent,
      message: 'Burn event logged successfully' 
    });
    
  } catch (error: any) {
    console.error('Error adding burn event:', error);
    return NextResponse.json(
      { error: 'Failed to add burn event', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}