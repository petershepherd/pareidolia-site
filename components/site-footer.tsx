"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trophy, Upload } from "lucide-react";

const LINKS = {
  telegram: "https://t.me/pareidoliaportal",
  xCommunity: "https://x.com/i/communities/1954506369618391171",
  dex: "https://letsbonk.fun/token/BXrwn2UWEeUAKghP8hatpW4i5AMchdscTzchMYE4bonk",
  explorer: "https://solscan.io/token/BXrwn2UWEeUAKghP8hatpW4i5AMchdscTzchMYE4bonk",
};

export function SiteFooter() {
  return (
    <footer className="relative mt-16 border-t border-white/5 bg-neutral-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 lg:grid-cols-4 md:grid-cols-2">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="relative h-6 w-6 overflow-hidden rounded-full">
                <span className="absolute inset-0 bg-gradient-to-tr from-cyan-500 via-fuchsia-500 to-amber-400 animate-pulse" />
              </span>
              <span className="font-black tracking-wide">PAREIDOLIA</span>
            </div>
            <p className="text-sm text-neutral-400 mb-4">
              See what you want to see. Turn market patterns into meme magic with the power of perception.
            </p>
            <p className="text-xs text-neutral-500">
              © {new Date().getFullYear()} Pareidolia Coin Hub
            </p>
          </div>

          {/* Community Section */}
          <div>
            <h3 className="font-semibold text-white mb-4">Community</h3>
            <nav className="space-y-2">
              <Link 
                href="/contest" 
                className="block text-sm text-neutral-400 hover:text-white transition-colors"
              >
                <Trophy className="inline h-4 w-4 mr-2" />
                Contest
              </Link>
              <Link 
                href="/submit" 
                className="block text-sm text-neutral-400 hover:text-white transition-colors"
              >
                <Upload className="inline h-4 w-4 mr-2" />
                Submit a Meme
              </Link>
              <Link 
                href="/leaderboard" 
                className="block text-sm text-neutral-400 hover:text-white transition-colors"
              >
                <Trophy className="inline h-4 w-4 mr-2" />
                Leaderboard
              </Link>
               <Link 
                href="/manifesto" 
                className="block text-sm text-neutral-400 hover:text-white transition-colors"
              >
                <FileText className="inline h-4 w-4 mr-2" />
                Manifesto
              </Link>
            </nav>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <nav className="space-y-2">
              <Link 
                href="/meme" 
                className="block text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Meme Generator
              </Link>
              <a 
                href={LINKS.explorer}
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Token Explorer
                <ExternalLink className="inline h-3 w-3 ml-1" />
              </a>
              <a 
                href={LINKS.dex}
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Trade Token
                <ExternalLink className="inline h-3 w-3 ml-1" />
              </a>
            </nav>
          </div>

          {/* Social & Legal Section */}
          <div>
            <h3 className="font-semibold text-white mb-4">Connect</h3>
            <nav className="space-y-2 mb-6">
              <a 
                href={LINKS.xCommunity}
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-neutral-400 hover:text-white transition-colors"
              >
                X Community
                <ExternalLink className="inline h-3 w-3 ml-1" />
              </a>
              <a 
                href={LINKS.telegram}
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Telegram
                <ExternalLink className="inline h-3 w-3 ml-1" />
              </a>
            </nav>
            
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs text-neutral-500 mb-2">Legal</p>
              <p className="text-xs text-neutral-600">
                Cryptocurrency trading involves risk. 
                DYOR and trade responsibly.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-neutral-400">
              Built on Solana • Powered by Community
            </div>
            
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" className="rounded-2xl border-white/20 text-white hover:bg-white/10">
                <a href={LINKS.dex} target="_blank" rel="noreferrer">
                  Trade <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              
              <Button asChild variant="ghost" className="rounded-2xl text-neutral-300 hover:text-white">
                <a href={LINKS.telegram} target="_blank" rel="noreferrer">
                  Join Telegram <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
