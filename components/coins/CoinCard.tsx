// components/coins/CoinCard.tsx

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink, Twitter, Send, TrendingUp, Users, BarChart3, Eye } from 'lucide-react';
import { CoinWithStatus } from '@/lib/coins/types';
import { getStatusBadgeClassName, getStatusLabel } from '@/lib/coins/badges';
import { 
  formatPrice, 
  formatMarketCap, 
  formatVolume, 
  formatHolders, 
  formatPercentage, 
  formatScore,
  formatFollowers,
  formatTimestamp,
  getPatternTypeLabel,
  getPatternTypeBadgeColor,
  getPerformanceColor,
  getScoreColor
} from '@/lib/coins/utils';

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
              {coin.patternType && (
                <Badge className={`text-xs border ${getPatternTypeBadgeColor(coin.patternType)}`}>
                  {getPatternTypeLabel(coin.patternType)}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className="text-xs border border-white/20 bg-white/10 text-white">
              {coin.chain}
            </Badge>
            {coin.change24h !== undefined && (
              <Badge className={`text-xs border border-white/20 ${getPerformanceColor(coin.change24h)} bg-white/5`}>
                {formatPercentage(coin.change24h)}
              </Badge>
            )}
          </div>
        </div>
        
        {coin.description && (
          <p className="text-sm text-neutral-300 mt-2 line-clamp-2">
            {coin.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Market Metrics */}
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-neutral-400 mb-2">Market Data</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">Price:</span>
              <span className="font-medium">{formatPrice(coin.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Market Cap:</span>
              <span className="font-medium">{formatMarketCap(coin.marketCap)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Volume 24h:</span>
              <span className="font-medium">{formatVolume(coin.volume24h)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Holders:</span>
              <span className="font-medium">{formatHolders(coin.holders)}</span>
            </div>
          </div>
        </div>

        {/* Pareidolia Metrics */}
        {(coin.pareidoliaScore || coin.visualSimilarity || coin.patternStrength) && (
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-neutral-400 mb-2">Pareidolia Metrics</div>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {coin.pareidoliaScore && (
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Pattern Score:
                  </span>
                  <span className={`font-medium ${getScoreColor(coin.pareidoliaScore)}`}>
                    {formatScore(coin.pareidoliaScore)}
                  </span>
                </div>
              )}
              {coin.visualSimilarity && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Similarity:</span>
                  <span className={`font-medium ${getScoreColor(coin.visualSimilarity)}`}>
                    {formatScore(coin.visualSimilarity)}
                  </span>
                </div>
              )}
              {coin.patternStrength && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Strength:</span>
                  <span className={`font-medium ${getScoreColor(coin.patternStrength)}`}>
                    {formatScore(coin.patternStrength)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social Metrics */}
        {(coin.twitterFollowers || coin.telegramMembers) && (
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-neutral-400 mb-2">Social</div>
            <div className="flex gap-4 text-sm">
              {coin.twitterFollowers && (
                <div className="flex items-center gap-1 text-blue-400">
                  <Twitter className="h-3 w-3" />
                  <span>{formatFollowers(coin.twitterFollowers)}</span>
                </div>
              )}
              {coin.telegramMembers && (
                <div className="flex items-center gap-1 text-cyan-400">
                  <Send className="h-3 w-3" />
                  <span>{formatFollowers(coin.telegramMembers)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Launch Info */}
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-neutral-400 mb-2">Launch Info</div>
          <div className="text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">Launched:</span>
              <span>{formatTimestamp(coin.createdAt)}</span>
            </div>
            {coin.launchPrice && (
              <div className="flex justify-between mt-1">
                <span className="text-neutral-400">Launch Price:</span>
                <span>{formatPrice(coin.launchPrice)}</span>
              </div>
            )}
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

          {coin.website && (
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl text-neutral-300 hover:text-white"
              asChild
            >
              <a href={coin.website} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3 w-3" />
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
                <BarChart3 className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}