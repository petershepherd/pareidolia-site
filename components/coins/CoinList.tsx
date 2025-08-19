// components/coins/CoinList.tsx

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, ArrowUpDown, ChevronDown } from 'lucide-react';
import { CoinCard } from './CoinCard';
import { CoinWithStatus, PareidoliaPatternType } from '@/lib/coins/types';
import { sortCoins, filterCoinsByOptions, SortOption, FilterOptions } from '@/lib/coins/utils';

type CoinListProps = {
  onMemeClick?: (coinSymbol: string) => void;
};

export function CoinList({ onMemeClick }: CoinListProps) {
  const [allCoins, setAllCoins] = useState<CoinWithStatus[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<CoinWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and basic filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Advanced sorting and filtering
  const [sortBy, setSortBy] = useState<SortOption>('marketCap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({});

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
      setAllCoins(data.coins || []);
    } catch (err: any) {
      console.error('Error loading coins:', err);
      setError(err.message || 'Failed to load coins');
      setAllCoins([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply local filtering and sorting
  useEffect(() => {
    let coins = [...allCoins];
    
    // Apply advanced filters
    coins = filterCoinsByOptions(coins, advancedFilters);
    
    // Apply sorting
    coins = sortCoins(coins, sortBy, sortDirection);
    
    setFilteredCoins(coins);
  }, [allCoins, advancedFilters, sortBy, sortDirection]);
  
  // Load coins on mount and basic filter changes
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

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('desc');
    }
  };

  const handleAdvancedFilterChange = (key: keyof FilterOptions, value: any) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  const clearAllFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setAdvancedFilters({});
    setSortBy('marketCap');
    setSortDirection('desc');
  };

  const statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'NEW', label: 'New' },
    { value: 'EARLY', label: 'Early' },
    { value: 'ESTABLISHED', label: 'Established' },
  ];

  const sortOptions = [
    { value: 'marketCap' as SortOption, label: 'Market Cap' },
    { value: 'pareidoliaScore' as SortOption, label: 'Pareidolia Score' },
    { value: 'change24h' as SortOption, label: '24h Change' },
    { value: 'launchDate' as SortOption, label: 'Launch Date' },
    { value: 'volume24h' as SortOption, label: 'Volume 24h' },
    { value: 'holders' as SortOption, label: 'Holders' },
    { value: 'name' as SortOption, label: 'Name' },
  ];

  const patternOptions = [
    { value: '', label: 'All Patterns' },
    { value: 'faces', label: 'Faces' },
    { value: 'animals', label: 'Animals' }, 
    { value: 'objects', label: 'Objects' },
    { value: 'landscapes', label: 'Landscapes' },
    { value: 'abstract', label: 'Abstract' },
    { value: 'mixed', label: 'Mixed' },
  ];

  const marketCapRanges = [
    { value: '', label: 'Any Market Cap' },
    { value: 'under_100k', label: 'Under $100K' },
    { value: '100k_1m', label: '$100K - $1M' },
    { value: '1m_10m', label: '$1M - $10M' },
    { value: '10m_100m', label: '$10M - $100M' },
    { value: 'over_100m', label: 'Over $100M' },
  ];

  const handleMarketCapRangeChange = (range: string) => {
    let minMarketCap: number | undefined;
    let maxMarketCap: number | undefined;

    switch (range) {
      case 'under_100k':
        maxMarketCap = 100000;
        break;
      case '100k_1m':
        minMarketCap = 100000;
        maxMarketCap = 1000000;
        break;
      case '1m_10m':
        minMarketCap = 1000000;
        maxMarketCap = 10000000;
        break;
      case '10m_100m':
        minMarketCap = 10000000;
        maxMarketCap = 100000000;
        break;
      case 'over_100m':
        minMarketCap = 100000000;
        break;
    }

    setAdvancedFilters(prev => ({
      ...prev,
      minMarketCap,
      maxMarketCap
    }));
  };

  const activeFiltersCount = Object.values(advancedFilters).filter(v => v !== undefined).length;

  return (
    <div className="space-y-6">
      {/* Basic Filters */}
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

      {/* Sorting and Advanced Filters Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 items-center">
          <ArrowUpDown className="h-4 w-4 text-neutral-400" />
          <span className="text-sm text-neutral-400">Sort by:</span>
          {sortOptions.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={sortBy === option.value ? 'default' : 'ghost'}
              className="rounded-xl text-sm"
              onClick={() => handleSortChange(option.value)}
            >
              {option.label}
              {sortBy === option.value && (
                <span className="ml-1">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </Button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl border-white/20"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                {activeFiltersCount}
              </Badge>
            )}
            <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
          </Button>

          {(search || statusFilter !== 'ALL' || activeFiltersCount > 0) && (
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl text-neutral-300 hover:text-white"
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-black/20 border border-white/10 rounded-2xl p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pattern Type Filter */}
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Pattern Type</label>
              <select
                value={advancedFilters.patternType || ''}
                onChange={(e) => handleAdvancedFilterChange('patternType', e.target.value as PareidoliaPatternType)}
                className="w-full rounded-xl bg-black/30 border-white/20 text-white p-2 text-sm"
              >
                {patternOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-neutral-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Market Cap Range */}
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Market Cap</label>
              <select
                value=""
                onChange={(e) => handleMarketCapRangeChange(e.target.value)}
                className="w-full rounded-xl bg-black/30 border-white/20 text-white p-2 text-sm"
              >
                {marketCapRanges.map((option) => (
                  <option key={option.value} value={option.value} className="bg-neutral-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Pareidolia Score Range */}
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Min Pareidolia Score</label>
              <select
                value={advancedFilters.minPareidoliaScore || ''}
                onChange={(e) => handleAdvancedFilterChange('minPareidoliaScore', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full rounded-xl bg-black/30 border-white/20 text-white p-2 text-sm"
              >
                <option value="" className="bg-neutral-800">Any Score</option>
                <option value="50" className="bg-neutral-800">50+</option>
                <option value="70" className="bg-neutral-800">70+</option>
                <option value="80" className="bg-neutral-800">80+</option>
                <option value="90" className="bg-neutral-800">90+</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results info */}
      {!loading && (
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <span>{filteredCoins.length} coin{filteredCoins.length !== 1 ? 's' : ''} found</span>
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
          {activeFiltersCount > 0 && (
            <Badge className="text-xs border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
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
      {!loading && !error && filteredCoins.length === 0 && (
        <div className="text-center py-8">
          <div className="text-neutral-400 mb-2">
            {search || statusFilter !== 'ALL' || activeFiltersCount > 0
              ? 'No coins match your filters' 
              : 'No coins found'
            }
          </div>
          {(search || statusFilter !== 'ALL' || activeFiltersCount > 0) && (
            <Button
              variant="ghost"
              className="rounded-xl text-neutral-300 hover:text-white"
              onClick={clearAllFilters}
            >
              Clear all filters
            </Button>
          )}
        </div>
      )}
      
      {/* Coins grid */}
      {!loading && !error && filteredCoins.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCoins.map((coin) => (
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