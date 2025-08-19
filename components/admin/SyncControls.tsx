// components/admin/SyncControls.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

type SyncStatus = {
  isRunning: boolean;
  lastSyncAt: string | null;
  nextSyncAt: string | null;
  lastError: string | null;
  totalCoins: number;
  syncedCoins: number;
  failedCoins: number;
};

export function SyncControls() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/coins/sync');
      const data = await response.json();
      
      if (data.success) {
        setSyncStatus(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch sync status');
      }
    } catch (err: any) {
      setError('Network error: ' + (err.message || 'Unknown error'));
    }
  };

  const triggerSync = async (forceSync = false) => {
    setSyncing(true);
    setError(null);

    try {
      const response = await fetch('/api/coins/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forceSync }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh status after successful sync
        setTimeout(fetchSyncStatus, 1000);
      } else {
        setError(data.message || 'Sync failed');
      }
    } catch (err: any) {
      setError('Network error: ' + (err.message || 'Unknown error'));
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
    
    // Auto-refresh status every 30 seconds
    const interval = setInterval(fetchSyncStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  const getSyncStatusBadge = () => {
    if (!syncStatus) return null;

    if (syncStatus.isRunning || syncing) {
      return (
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          Syncing
        </Badge>
      );
    }

    if (syncStatus.lastError) {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
          <XCircle className="h-3 w-3 mr-1" />
          Error
        </Badge>
      );
    }

    if (syncStatus.lastSyncAt) {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <CheckCircle className="h-3 w-3 mr-1" />
          Healthy
        </Badge>
      );
    }

    return (
      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
        <AlertCircle className="h-3 w-3 mr-1" />
        Not Synced
      </Badge>
    );
  };

  return (
    <Card className="rounded-2xl bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Market Data Sync
          </CardTitle>
          {getSyncStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              {error}
            </div>
          </div>
        )}

        {syncStatus && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-neutral-400">Last Sync:</div>
              <div className="font-medium">{formatTimestamp(syncStatus.lastSyncAt)}</div>
            </div>
            <div>
              <div className="text-neutral-400">Total Coins:</div>
              <div className="font-medium">{syncStatus.totalCoins}</div>
            </div>
            {syncStatus.lastSyncAt && (
              <>
                <div>
                  <div className="text-neutral-400">Synced:</div>
                  <div className="font-medium text-green-400">{syncStatus.syncedCoins}</div>
                </div>
                <div>
                  <div className="text-neutral-400">Failed:</div>
                  <div className="font-medium text-red-400">{syncStatus.failedCoins}</div>
                </div>
              </>
            )}
          </div>
        )}

        {syncStatus?.lastError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="text-xs text-neutral-400 mb-1">Last Error:</div>
            <div className="text-sm text-red-400">{syncStatus.lastError}</div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => triggerSync(false)}
            disabled={syncing || (syncStatus?.isRunning ?? false)}
            className="rounded-xl flex-1"
          >
            {syncing || (syncStatus?.isRunning ?? false) ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
          
          <Button
            onClick={() => triggerSync(true)}
            disabled={syncing || (syncStatus?.isRunning ?? false)}
            variant="outline"
            className="rounded-xl"
          >
            Force Sync
          </Button>
          
          <Button
            onClick={fetchSyncStatus}
            variant="ghost"
            size="sm"
            className="rounded-xl"
          >
            <Clock className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}