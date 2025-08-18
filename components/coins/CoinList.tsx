// components/coins/CoinList.tsx

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { CoinCard } from './CoinCard';
import { CoinWithStatus } from '@/lib/coins/types';

type CoinListProps = {
  onMemeClick?: (coinSymbol: string) => void;
};

export function CoinList({ onMemeClick }: CoinListProps) {
  const [coins, setCoins] = useState<CoinWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  const loadCoins = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (search.trim()) {
        params.set('search', search.trim());
      }
      if (statusFilter !== 'ALL') {
        params.set('status', statusFilter);
      }
      
      const response = await fetch(`/api/coins?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch coins: ${response.status}`);
      }
      
      const data = await response.json();
      setCoins(data.coins || []);
    } catch (err: any) {
      console.error('Error loading coins:', err);
      setError(err.message || 'Failed to load coins');
      setCoins([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Load coins on mount and filter changes
  useEffect(() => {
    loadCoins();
  }, [search, statusFilter]);
  
  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadCoins();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [search]);
  
  const statusOptions = [
    { value: 'ALL', label: 'All Coins' },
    { value: 'NEW', label: 'New' },
    { value: 'EARLY', label: 'Early' },
    { value: 'ESTABLISHED', label: 'Established' },
  ];
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search coins by name, symbol, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-black/30 border-white/20 text-white placeholder:text-neutral-500"
          />
        </div>
        
        <div className="flex gap-2">
          <Filter className="h-4 w-4 text-neutral-400 mt-2.5" />
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={statusFilter === option.value ? 'default' : 'outline'}
              className="rounded-xl border-white/20"
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Results info */}
      {!loading && (
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <span>{coins.length} coin{coins.length !== 1 ? 's' : ''} found</span>
          {search && (
            <Badge className="text-xs border border-white/20 bg-white/10 text-white">
              Search: {search}
            </Badge>
          )}
          {statusFilter !== 'ALL' && (
            <Badge className="text-xs border border-white/20 bg-white/10 text-white">
              Status: {statusFilter}
            </Badge>
          )}
        </div>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="text-neutral-400">Loading coins...</div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="text-center py-8">
          <div className="text-red-400 mb-2">Error loading coins</div>
          <div className="text-sm text-neutral-400 mb-4">{error}</div>
          <Button
            variant="outline"
            className="rounded-xl border-white/20"
            onClick={loadCoins}
          >
            Retry
          </Button>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && !error && coins.length === 0 && (
        <div className="text-center py-8">
          <div className="text-neutral-400 mb-2">
            {search || statusFilter !== 'ALL' 
              ? 'No coins match your filters' 
              : 'No coins found'
            }
          </div>
          {(search || statusFilter !== 'ALL') && (
            <Button
              variant="ghost"
              className="rounded-xl text-neutral-300 hover:text-white"
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}
      
      {/* Coins grid */}
      {!loading && !error && coins.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {coins.map((coin) => (
            <CoinCard
              key={coin.id}
              coin={coin}
              onMemeClick={onMemeClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}