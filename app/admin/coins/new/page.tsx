"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isAllowedAdminWallet, checkAdminPin } from '@/lib/auth';
import { ArrowLeft, Plus, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function NewCoinPage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  
  // Auth state
  const [authed, setAuthed] = React.useState(false);
  const [checking, setChecking] = React.useState(true);
  
  // Form state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    id: '',
    symbol: '',
    name: '',
    description: '',
    contractAddress: '',
    website: '',
    twitter: '',
    telegram: '',
    dexUrl: '',
    explorerUrl: '',
  });
  
  // Check admin status on mount/connection
  React.useEffect(() => {
    const pk = publicKey?.toBase58().toLowerCase();
    const isAdmin = connected && pk ? isAllowedAdminWallet(pk) : false;

    if (!isAdmin) {
      setAuthed(false);
      setChecking(false);
      return;
    }

    const key = `pareidolia:admin:${pk}:authed`;
    const flag = sessionStorage.getItem(key) === '1';
    setAuthed(flag);
    setChecking(false);
  }, [connected, publicKey?.toBase58()]);
  
  const handleEnterPin = async () => {
    const pin = window.prompt('Enter admin PIN:');
    if (!pin) return;
    
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      
      const result = await response.json();
      
      if (!result.ok) {
        alert('Invalid PIN.');
        return;
      }
      
      const pk = publicKey?.toBase58().toLowerCase();
      const key = `pareidolia:admin:${pk}:authed`;
      sessionStorage.setItem(key, '1');
      setAuthed(true);
    } catch (error) {
      console.error('PIN verification failed:', error);
      alert('PIN verification failed.');
    }
  };
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id || !formData.symbol || !formData.name || !formData.contractAddress) {
      setError('Please fill in all required fields (ID, Symbol, Name, Contract Address)');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Use NEXT_PUBLIC_ADMIN_TOKEN if available, otherwise could prompt for runtime token
      const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN || '';
      
      if (!adminToken) {
        setError('Admin token not configured. Please set NEXT_PUBLIC_ADMIN_TOKEN or implement runtime token input.');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/admin/coins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`);
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error adding coin:', err);
      setError(err.message || 'Failed to add coin');
    } finally {
      setLoading(false);
    }
  };
  
  if (checking) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }
  
  if (!connected) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="mx-auto max-w-2xl px-4 py-20">
          <Card className="rounded-2xl bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Coin
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-neutral-300">Connect your wallet to access admin functions.</p>
              <WalletMultiButton className="mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  const pk = publicKey?.toBase58().toLowerCase();
  const isAdminWallet = pk ? isAllowedAdminWallet(pk) : false;
  
  if (!isAdminWallet) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="mx-auto max-w-2xl px-4 py-20">
          <Card className="rounded-2xl bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-400" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-neutral-300">This wallet is not authorized for admin functions.</p>
              <Link href="/admin">
                <Button variant="outline" className="rounded-2xl border-white/20">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Admin
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  if (!authed) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="mx-auto max-w-2xl px-4 py-20">
          <Card className="rounded-2xl bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-400" />
                PIN Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-neutral-300">Enter the admin PIN to access coin management.</p>
              <div className="flex gap-2">
                <Button onClick={handleEnterPin} className="rounded-2xl">
                  Enter PIN
                </Button>
                <Link href="/admin">
                  <Button variant="outline" className="rounded-2xl border-white/20">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="mx-auto max-w-2xl px-4 py-20">
          <Card className="rounded-2xl bg-white/5 border-white/10">
            <CardContent className="text-center py-8 space-y-4">
              <div className="text-green-400 text-2xl">✓</div>
              <h2 className="text-xl font-semibold">Coin Added Successfully!</h2>
              <p className="text-neutral-300">Redirecting to admin panel...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-2xl px-4 py-20">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" className="rounded-2xl">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
        </div>
        
        <Card className="rounded-2xl bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Coin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    ID * <span className="text-xs text-neutral-400">(unique identifier)</span>
                  </label>
                  <Input
                    value={formData.id}
                    onChange={(e) => handleInputChange('id', e.target.value)}
                    className="bg-black/30 border-white/20 text-white"
                    placeholder="e.g., pareidolia"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Symbol *
                  </label>
                  <Input
                    value={formData.symbol}
                    onChange={(e) => handleInputChange('symbol', e.target.value)}
                    className="bg-black/30 border-white/20 text-white"
                    placeholder="e.g., PAREIDOLIA"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-black/30 border-white/20 text-white"
                  placeholder="e.g., Pareidolia"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Description
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="bg-black/30 border-white/20 text-white"
                  placeholder="Brief description of the coin"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Contract Address * <span className="text-xs text-neutral-400">(Solana mint address)</span>
                </label>
                <Input
                  value={formData.contractAddress}
                  onChange={(e) => handleInputChange('contractAddress', e.target.value)}
                  className="bg-black/30 border-white/20 text-white"
                  placeholder="e.g., BXrwn2UWEeUAKghP8hatpW4i5AMchdscTzchMYE4bonk"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Website
                  </label>
                  <Input
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="bg-black/30 border-white/20 text-white"
                    placeholder="https://..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Twitter
                  </label>
                  <Input
                    value={formData.twitter}
                    onChange={(e) => handleInputChange('twitter', e.target.value)}
                    className="bg-black/30 border-white/20 text-white"
                    placeholder="https://x.com/..."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Telegram
                  </label>
                  <Input
                    value={formData.telegram}
                    onChange={(e) => handleInputChange('telegram', e.target.value)}
                    className="bg-black/30 border-white/20 text-white"
                    placeholder="https://t.me/..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    DEX URL
                  </label>
                  <Input
                    value={formData.dexUrl}
                    onChange={(e) => handleInputChange('dexUrl', e.target.value)}
                    className="bg-black/30 border-white/20 text-white"
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Explorer URL
                </label>
                <Input
                  value={formData.explorerUrl}
                  onChange={(e) => handleInputChange('explorerUrl', e.target.value)}
                  className="bg-black/30 border-white/20 text-white"
                  placeholder="https://solscan.io/token/..."
                />
              </div>
              
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl flex-1"
                >
                  {loading ? 'Adding...' : 'Add Coin'}
                </Button>
                
                <Link href="/admin">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl border-white/20"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}