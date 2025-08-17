// components/coins/CoinCard.tsx

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink, Twitter, Send, TrendingUp } from 'lucide-react';
import { CoinWithStatus } from '@/lib/coins/types';
import { getStatusBadgeClassName, getStatusLabel } from '@/lib/coins/badges';

type CoinCardProps = {
  coin: CoinWithStatus;
  onMemeClick?: (coinSymbol: string) => void;
};

export function CoinCard({ coin, onMemeClick }: CoinCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyContract = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(coin.contractAddress);
      } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = coin.contractAddress;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Failed to copy contract address:', error);
    }
  };

  const handleMemeClick = () => {
    if (onMemeClick) {
      onMemeClick(coin.symbol);
    } else {
      // Fallback to direct link with deep link parameter
      window.open(`/meme?coin=${coin.symbol}`, '_blank');
    }
  };

  return (
    <Card className="rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{coin.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-sm text-neutral-400">${coin.symbol}</code>
              <Badge className={`text-xs border ${getStatusBadgeClassName(coin.status)}`}>
                {getStatusLabel(coin.status)}
              </Badge>
            </div>
          </div>
          <Badge className="text-xs border border-white/20 bg-white/10 text-white">
            {coin.chain}
          </Badge>
        </div>
        
        {coin.description && (
          <p className="text-sm text-neutral-300 mt-2 line-clamp-2">
            {coin.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Metrics placeholders */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-neutral-400">Price:</span>
            <span className="ml-1">{coin.price ? `$${coin.price.toFixed(6)}` : 'TBA'}</span>
          </div>
          <div>
            <span className="text-neutral-400">Volume:</span>
            <span className="ml-1">{coin.volume24h ? `$${coin.volume24h.toLocaleString()}` : 'TBA'}</span>
          </div>
          <div>
            <span className="text-neutral-400">Liquidity:</span>
            <span className="ml-1">{coin.liquidity ? `$${coin.liquidity.toLocaleString()}` : 'TBA'}</span>
          </div>
          <div>
            <span className="text-neutral-400">Holders:</span>
            <span className="ml-1">{coin.holders ? coin.holders.toLocaleString() : 'TBA'}</span>
          </div>
        </div>
        
        {/* Contract Address */}
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-neutral-400">Contract</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-black/30 rounded px-2 py-1 break-all">
              {coin.contractAddress}
            </code>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl border-white/20 text-white hover:bg-white/10"
              onClick={handleCopyContract}
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {coin.dexUrl && (
            <Button
              size="sm"
              className="rounded-xl flex-1"
              asChild
            >
              <a href={coin.dexUrl} target="_blank" rel="noreferrer">
                <TrendingUp className="mr-1 h-3 w-3" />
                Trade
              </a>
            </Button>
          )}
          
          <Button
            size="sm"
            variant="secondary"
            className="rounded-xl"
            onClick={handleMemeClick}
          >
            Meme
          </Button>
          
          {coin.twitter && (
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl text-neutral-300 hover:text-white"
              asChild
            >
              <a href={coin.twitter} target="_blank" rel="noreferrer">
                <Twitter className="h-3 w-3" />
              </a>
            </Button>
          )}
          
          {coin.telegram && (
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl text-neutral-300 hover:text-white"
              asChild
            >
              <a href={coin.telegram} target="_blank" rel="noreferrer">
                <Send className="h-3 w-3" />
              </a>
            </Button>
          )}
          
          {coin.explorerUrl && (
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl text-neutral-300 hover:text-white"
              asChild
            >
              <a href={coin.explorerUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}