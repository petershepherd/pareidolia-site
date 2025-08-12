"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export type SiteLinks = {
  dex: string;
  xCommunity: string;
  telegram: string;
};

export function Navbar({ links }: { links: SiteLinks }) {
  return (
    <div className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60 border-b border-white/5">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        <a href="/" className="group inline-flex items-center gap-2">
          <span className="relative h-6 w-6 overflow-hidden rounded-full">
            <span className="absolute inset-0 bg-gradient-to-tr from-cyan-500 via-fuchsia-500 to-amber-400 animate-pulse" />
          </span>
          <span className="font-black tracking-wide">PAREIDOLIA</span>
        </a>
        <nav className="hidden md:flex items-center gap-2">
          <NavLink href="/#what">What is</NavLink>
          <NavLink href="/#token">Token</NavLink>
          <NavLink href="/#why">Why now</NavLink>
          <NavLink href="/#roadmap">Roadmap</NavLink>
          <NavLink href="/#join">Join</NavLink>
          <NavLink href="/meme">Meme tool</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary" className="rounded-2xl">
            <a href={links.dex} target="_blank" rel="noreferrer">
              Buy Token <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
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
