"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  ExternalLink,
  Twitter,
  Send,
  Image as ImageIcon,
  Trophy,
  Upload,
  ChevronDown,
} from "lucide-react";

// Wallet connect button (styles are provided by WalletProviders import elsewhere)
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

type ExternalLinks = {
  dex: string;
  xCommunity: string;
  telegram: string;
};

type NavbarProps = {
  links?: ExternalLinks;
  // showAdmin?: boolean; // ← eltávolítva: nem jelenítünk meg Admin gombot
};

const DEFAULT_LINKS: ExternalLinks = {
  dex: "https://letsbonk.fun/token/BXrwn2UWEeUAKghP8hatpW4i5AMchdscTzchMYE4bonk",
  xCommunity: "https://x.com/i/communities/1954506369618391171",
  telegram: "https://t.me/pareidoliaportal",
};

const INTERNAL_NAV = [
  { href: "/", label: "Home" },
];

const MEME_NAV_ITEMS = [
  { href: "/meme", label: "Generator", icon: <ImageIcon className="h-4 w-4" /> },
  { href: "/contest", label: "Contest", icon: <Trophy className="h-4 w-4" /> },
  { href: "/submit", label: "Submit", icon: <Upload className="h-4 w-4" /> },
  { href: "/leaderboard", label: "Leaderboard", icon: <Trophy className="h-4 w-4" /> },
];

export function Navbar({ links = DEFAULT_LINKS }: NavbarProps) {
  const [open, setOpen] = React.useState(false);
  const [memeDropdownOpen, setMemeDropdownOpen] = React.useState(false);
  const [mobileMemeSectionOpen, setMobileMemeSectionOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  // close on hash change (best-effort)
  React.useEffect(() => {
    const onHash = () => {
      setOpen(false);
      setMemeDropdownOpen(false);
      setMobileMemeSectionOpen(false);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Handle click outside dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMemeDropdownOpen(false);
      }
    };
    
    if (memeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [memeDropdownOpen]);

  // Handle ESC key
  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMemeDropdownOpen(false);
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        {/* Brand */}
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="relative h-6 w-6 overflow-hidden rounded-full">
            <span className="absolute inset-0 bg-gradient-to-tr from-cyan-500 via-fuchsia-500 to-amber-400 animate-pulse" />
          </span>
          <span className="font-black tracking-wide">PAREIDOLIA</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          {INTERNAL_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition"
            >
              {item.label}
            </Link>
          ))}
          
          {/* Meme dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition"
              onClick={() => setMemeDropdownOpen((prev) => !prev)}
              aria-expanded={memeDropdownOpen}
              aria-haspopup="true"
            >
              Meme
              <ChevronDown className={`h-3 w-3 transition-transform ${memeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {memeDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-neutral-900 border border-white/10 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  {MEME_NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition"
                      onClick={() => setMemeDropdownOpen(false)}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* NINCS admin gomb – az automatikus redirect intézi */}
        </nav>

        {/* Desktop actions (wallet + externals) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Wallet connect (admin auth-hoz is ez kell) */}
          <WalletMultiButton className="!rounded-2xl !bg-white/10 !text-white !border !border-white/20 hover:!bg-white/20" />

          <Button asChild variant="outline" className="rounded-2xl border-white/20 text-white hover:bg-white/10">
            <a href={links.dex} target="_blank" rel="noreferrer">
              Buy <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="ghost" className="rounded-2xl text-neutral-300 hover:text-white">
            <a href={links.xCommunity} target="_blank" rel="noreferrer">
              X <Twitter className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="ghost" className="rounded-2xl text-neutral-300 hover:text-white">
            <a href={links.telegram} target="_blank" rel="noreferrer">
              Telegram <Send className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-neutral-950/90 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3">
            <div className="grid gap-1">
              {INTERNAL_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-neutral-200 hover:bg-white/5"
                  onClick={() => setOpen(false)}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Meme collapsible section */}
              <div>
                <button
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-neutral-200 hover:bg-white/5"
                  onClick={() => setMobileMemeSectionOpen((prev) => !prev)}
                  aria-expanded={mobileMemeSectionOpen}
                >
                  <span>Meme</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ml-auto ${mobileMemeSectionOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {mobileMemeSectionOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {MEME_NAV_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-neutral-300 hover:bg-white/5"
                        onClick={() => {
                          setOpen(false);
                          setMobileMemeSectionOpen(false);
                        }}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {/* NINCS admin gomb mobilon sem */}
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {/* Wallet on mobile */}
              <WalletMultiButton className="!rounded-2xl !bg-white/10 !text-white !border !border-white/20 hover:!bg-white/20" />

              <div className="flex flex-wrap items-center gap-2">
                <Button asChild className="rounded-2xl">
                  <a href={links.dex} target="_blank" rel="noreferrer">
                    Buy <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="secondary" className="rounded-2xl">
                  <a href={links.xCommunity} target="_blank" rel="noreferrer">
                    X <Twitter className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="ghost" className="rounded-2xl text-neutral-300 hover:text-white">
                  <a href={links.telegram} target="_blank" rel="noreferrer">
                    Telegram <Send className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
