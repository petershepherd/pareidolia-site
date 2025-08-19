// components/coins/CoinList.tsx

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Copy, Check, ExternalLink, Twitter, Send, TrendingUp } from 'lucide-react';
import { CoinWithStatus } from '@/lib/coins/types';
import { getStatusBadgeClassName, getStatusLabel, getCoinAgeInDays } from '@/lib/coins/badges';

type CoinListProps = {
  onMemeClick?: (coinSymbol: string) => void;
};

export function CoinList({ onMemeClick }: CoinListProps) {
  const [coins, setCoins] = useState<CoinWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  
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

  const handleCopyContract = async (contractAddress: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(contractAddress);
      } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = contractAddress;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedAddress(contractAddress);
      setTimeout(() => setCopiedAddress(null), 1500);
    } catch (error) {
      console.error('Failed to copy contract address:', error);
    }
  };

  const handleMemeClick = (coinSymbol: string) => {
    if (onMemeClick) {
      onMemeClick(coinSymbol);
    } else {
      // Fallback to direct link with deep link parameter
      window.open(`/meme?coin=${coinSymbol}`, '_blank');
    }
  };
  
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
      
      {/* Coins table */}
      {!loading && !error && coins.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Coin</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400 hidden sm:table-cell">Age</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400 hidden md:table-cell">Contract Address</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coins.map((coin) => (
                <tr key={coin.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  {/* Coin Name/Symbol */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {coin.symbol.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-white">{coin.name}</div>
                        <div className="text-sm text-neutral-400">${coin.symbol}</div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Status */}
                  <td className="py-4 px-4">
                    <Badge className={`text-xs border ${getStatusBadgeClassName(coin.status)}`}>
                      {getStatusLabel(coin.status)}
                    </Badge>
                  </td>
                  
                  {/* Age - hidden on mobile */}
                  <td className="py-4 px-4 hidden sm:table-cell">
                    <span className="text-neutral-300">
                      {getCoinAgeInDays(coin)} days
                    </span>
                  </td>
                  
                  {/* Contract Address - hidden on mobile/tablet */}
                  <td className="py-4 px-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-black/30 rounded px-2 py-1 text-neutral-300 max-w-32 truncate">
                        {coin.contractAddress}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-neutral-400 hover:text-white"
                        onClick={() => handleCopyContract(coin.contractAddress)}
                      >
                        {copiedAddress === coin.contractAddress ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </td>
                  
                  {/* Actions */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      {coin.dexUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
                          asChild
                        >
                          <a href={coin.dexUrl} target="_blank" rel="noreferrer" title="Trade">
                            <TrendingUp className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-xs text-neutral-400 hover:text-white"
                        onClick={() => handleMemeClick(coin.symbol)}
                      >
                        Meme
                      </Button>
                      
                      {coin.twitter && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
                          asChild
                        >
                          <a href={coin.twitter} target="_blank" rel="noreferrer" title="Twitter">
                            <Twitter className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                      
                      {coin.telegram && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
                          asChild
                        >
                          <a href={coin.telegram} target="_blank" rel="noreferrer" title="Telegram">
                            <Send className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                      
                      {coin.explorerUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
                          asChild
                        >
                          <a href={coin.explorerUrl} target="_blank" rel="noreferrer" title="Explorer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}