"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Trophy, ImageIcon, Flame, TrendingUp } from "lucide-react";
import { CoinList } from "@/components/coins/CoinList";
import Link from "next/link";

/* ------------------------------- LINKS ------------------------------- */

const LINKS = {
  telegram: "https://t.me/pareidoliaportal",
  xCommunity: "https://x.com/i/communities/1954506369618391171",
  dex: "https://letsbonk.fun/token/BXrwn2UWEeUAKghP8hatpW4i5AMchdscTzchMYE4bonk",
  explorer: "https://solscan.io/token/BXrwn2UWEeUAKghP8hatpW4i5AMchdscTzchMYE4bonk",
};

/* ------------------------------- PAGE ROOT ------------------------------- */

export default function Page() {
  const handleMemeClick = (coinSymbol: string) => {
    // Deep link to meme generator with coin parameter
    window.open(`/meme?coin=${coinSymbol}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-cyan-500/40 selection:text-white">
      <AnimatedBackground />

      <main className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CoinHubHero />
        <BuybackBurnWidget />
        <CoinListSection onMemeClick={handleMemeClick} />
        <LegacyLinks />
      </main>

      <Footer />
    </div>
  );
}

/* --------------------------------- HERO --------------------------------- */

function CoinHubHero() {
  return (
    <section className="relative py-16 sm:py-20">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 bg-clip-text text-transparent">
              Illusion Of Life
            </span>
            , powered by Pareidolia
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-xl text-neutral-300">
            See what you want to see. Turn market patterns into meme magic with the power of perception and pattern recognition.
          </p>
        </motion.div>
        
        <motion.div
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Button asChild size="lg" className="rounded-2xl">
            <a href={LINKS.dex} target="_blank" rel="noreferrer">
              <TrendingUp className="mr-2 h-4 w-4" />
              Trade $PAREIDOLIA
            </a>
          </Button>
          
          <Button asChild variant="secondary" size="lg" className="rounded-2xl">
            <Link href="/meme">
              <ImageIcon className="mr-2 h-4 w-4" />
              Meme Generator
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="rounded-2xl border-white/20 text-white hover:bg-white/10">
            <Link href="/contest">
              <Trophy className="mr-2 h-4 w-4" />
              Legacy Contest
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

/* --------------------------- BUYBACK & BURN WIDGET --------------------------- */

function BuybackBurnWidget() {
  return (
    <section className="relative py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="rounded-2xl bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 border-red-500/20">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Flame className="h-6 w-6 text-orange-400" />
              Buyback &amp; Burn Program
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">TBA</div>
                <div className="text-sm text-neutral-400">Total Burned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">TBA</div>
                <div className="text-sm text-neutral-400">Last Burn Event</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">TBA</div>
                <div className="text-sm text-neutral-400">Burn Value</div>
              </div>
            </div>
            
            <div className="text-center pt-2">
              <p className="text-sm text-neutral-300">
                Automatic buyback and burn events create deflationary pressure. 
                Transparency reports coming soon.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}

/* ----------------------------- COIN LIST SECTION ----------------------------- */

function CoinListSection({ onMemeClick }: { onMemeClick: (symbol: string) => void }) {
  return (
    <section className="relative py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Discover Coins</h2>
          <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
            Explore the growing ecosystem of Solana meme coins. Find the next gem, 
            check live metrics, and create memes that matter.
          </p>
        </div>
        
        <CoinList onMemeClick={onMemeClick} />
      </motion.div>
    </section>
  );
}

/* ----------------------------- LEGACY LINKS ----------------------------- */

function LegacyLinks() {
  return (
    <section className="relative py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center"
      >
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-neutral-400 mb-2">More Ways to Participate</h3>
          <p className="text-neutral-500 text-sm">
            The original contest and community features are still available
          </p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="ghost" className="rounded-2xl text-neutral-400 hover:text-white">
            <Link href="/contest">
              <Trophy className="mr-2 h-4 w-4" />
              Meme Contest
            </Link>
          </Button>
          
          <Button asChild variant="ghost" className="rounded-2xl text-neutral-400 hover:text-white">
            <Link href="/submit">
              Submit Entry
            </Link>
          </Button>
          
          <Button asChild variant="ghost" className="rounded-2xl text-neutral-400 hover:text-white">
            <Link href="/leaderboard">
              Leaderboard
            </Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}

/* -------------------------------- FOOTER -------------------------------- */

function Footer() {
  return (
    <footer className="relative mt-16 border-t border-white/5 bg-neutral-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-neutral-400">
            © {new Date().getFullYear()} Pareidolia Coin Hub
          </div>
          
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="rounded-2xl border-white/20 text-white hover:bg-white/10">
              <a href={LINKS.dex} target="_blank" rel="noreferrer">
                Trade <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            
            <Button asChild variant="ghost" className="rounded-2xl text-neutral-300 hover:text-white">
              <a href={LINKS.xCommunity} target="_blank" rel="noreferrer">
                Community <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            
            <Button asChild variant="ghost" className="rounded-2xl text-neutral-300 hover:text-white">
              <a href={LINKS.telegram} target="_blank" rel="noreferrer">
                Telegram <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* --------------------------- BACKGROUND FX --------------------------- */

function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08),transparent_60%)]" />
      <Blob className="left-[-10%] top-[-10%]" delay={0} />
      <Blob className="right-[-15%] bottom-[-15%]" delay={8} />
      <GridNoise />
    </div>
  );
}

function Blob({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute h-[42vmax] w-[42vmax] rounded-[40%] bg-gradient-to-tr from-fuchsia-500/20 via-cyan-500/20 to-amber-400/20 blur-3xl ${className}`}
      animate={{ 
        borderRadius: ["40%", "45% 35% 50% 40%", "50%", "35% 55% 45% 60%", "40%"], 
        x: [0, 50, -40, 30, 0], 
        y: [0, -30, 40, -20, 0] 
      }}
      transition={{ duration: 24, ease: "easeInOut", repeat: Infinity, delay }}
    />
  );
}

function GridNoise() {
  return (
    <div className="absolute inset-0 opacity-[0.08] [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)]" />
  );
}