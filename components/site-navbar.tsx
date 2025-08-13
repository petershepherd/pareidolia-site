// components/site-navbar.tsx
"use client";

import * as React from "react";
import { Menu, X, ExternalLink, Twitter, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

type Links = {
  dex: string;
  xCommunity: string;
  telegram: string;
};

export function Navbar({ links }: { links: Links }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        {/* Logo / Brand */}
        <a href="/" className="group inline-flex items-center gap-2">
          <span className="relative h-6 w-6 overflow-hidden rounded-full">
            <span className="absolute inset-0 bg-gradient-to-tr from-cyan-500 via-fuchsia-500 to-amber-400 animate-pulse" />
          </span>
          <span className="font-black tracking-wide">PAREIDOLIA</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLink href="/#what">What is</NavLink>
          <NavLink href="/#token">Token</NavLink>
          <NavLink href="/#why">Why now</NavLink>
          <NavLink href="/#roadmap">Roadmap</NavLink>
          <NavLink href="/#join">Join</NavLink>
          <NavLink href="/meme">Meme tool</NavLink>
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button asChild variant="secondary" className="rounded-2xl">
            <a href={links.dex} target="_blank" rel="noreferrer">
              Buy Token <ExternalLink className="ml-2 h-4 w-4" />
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

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-xl px-3 py-2 text-neutral-200 hover:bg-white/10 border border-white/10"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile panel */}
      <div
        className={`md:hidden overflow-hidden border-t border-white/5 transition-[max-height,opacity] duration-300 ${
          open ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-4 space-y-4 bg-neutral-950/80">
          <div className="grid gap-1">
            <MobileLink href="/#what" onClick={() => setOpen(false)}>What is</MobileLink>
            <MobileLink href="/#token" onClick={() => setOpen(false)}>Token</MobileLink>
            <MobileLink href="/#why" onClick={() => setOpen(false)}>Why now</MobileLink>
            <MobileLink href="/#roadmap" onClick={() => setOpen(false)}>Roadmap</MobileLink>
            <MobileLink href="/#join" onClick={() => setOpen(false)}>Join</MobileLink>
            <MobileLink href="/meme" onClick={() => setOpen(false)}>Meme tool</MobileLink>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button asChild className="rounded-2xl">
              <a href={links.dex} target="_blank" rel="noreferrer">
                Buy Token <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-2xl border-white/20 text-white hover:bg-white/10">
              <a href={links.xCommunity} target="_blank" rel="noreferrer">
                X Community <Twitter className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-2xl border-white/20 text-white hover:bg-white/10">
              <a href={links.telegram} target="_blank" rel="noreferrer">
                Telegram <Send className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="rounded-full px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition"
    >
      {children}
    </a>
  );
}

function MobileLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="block rounded-xl px-3 py-2 text-base text-neutral-200 hover:text-white hover:bg-white/5 transition"
    >
      {children}
    </a>
  );
}
