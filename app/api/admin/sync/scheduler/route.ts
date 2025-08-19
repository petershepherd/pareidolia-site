// app/api/admin/sync/scheduler/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getScheduler } from '@/lib/background/scheduler';

export const dynamic = 'force-dynamic';

function isAdminRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const adminToken = process.env.ADMIN_TOKEN;
  
  return Boolean(token && adminToken && token === adminToken);
}

export async function GET(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const scheduler = getScheduler();
    const status = scheduler.getStatus();

    return NextResponse.json({
      success: true,
      data: {
        ...status,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error getting scheduler status:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get scheduler status', 
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { action } = body;

    const scheduler = getScheduler();

    if (action === 'start') {
      scheduler.start();
      return NextResponse.json({
        success: true,
        message: 'Background scheduler started',
        data: scheduler.getStatus(),
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'stop') {
      scheduler.stop();
      return NextResponse.json({
        success: true,
        message: 'Background scheduler stopped',
        data: scheduler.getStatus(),
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Invalid action. Use "start" or "stop"',
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Error managing scheduler:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to manage scheduler', 
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}