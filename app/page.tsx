```tsx
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Copy, Check, ExternalLink, Twitter, Send, Link as LinkIcon } from "lucide-react";

const LINKS = {
  telegram: "https://t.me/+1beBi38OMY0wOGJk",
  xCommunity: "https://x.com/i/communities/1954506369618391171",
  dex: "https://letsbonk.fun/token/BXrwn2UWEeUAKghP8hatpW4i5AMchdscTzchMYE4bonk",
  explorer: "#",
};

const TOKEN = {
  chain: "Solana",
  ticker: "PAREIDOLIA",
  contract: "BXrwn2UWEeUAKghP8hatpW4i5AMchdscTzchMYE4bonk",
  supply: "–",
};

const __SHOW_TESTS__ = false;

export default function Page() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-cyan-500/40 selection:text-white">
      <AnimatedBackground />
      <Navbar />
      <main className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Hero />
        <WhatIs />
        <TokenOverview />
        <WhyNow />
        <Roadmap />
        <JoinUs />
        {__SHOW_TESTS__ && <DevTests />}
      </main>
      <Footer />
      <EasterEggFace />
    </div>
  );
}

function Navbar() {
  return (
    <div className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60 border-b border-white/5">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        <a href="#top" className="group inline-flex items-center gap-2">
          <span className="relative h-6 w-6 overflow-hidden rounded-full">
            <span className="absolute inset-0 bg-gradient-to-tr from-cyan-500 via-fuchsia-500 to-amber-400 animate-pulse" />
          </span>
          <span className="font-black tracking-wide">PAREIDOLIA</span>
        </a>
        <nav className="hidden md:flex items-center gap-2">
          <NavLink href="#what">What is</NavLink>
          <NavLink href="#token">Token</NavLink>
          <NavLink href="#why">Why now</NavLink>
          <NavLink href="#roadmap">Roadmap</NavLink>
          <NavLink href="#join">Join</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary" className="rounded-2xl">
            <a href={LINKS.dex} target="_blank" rel="noreferrer">
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
    <a href={href} className="rounded-full px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition">{children}</a>
  );
}

function Hero() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-100, 100], [-5, 5]);
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      x.set((e.clientX - cx) / 20);
      y.set((e.clientY - cy) / 20);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y]);

  return (
    <section id="top" className="relative py-20 sm:py-28">
      <motion.div style={{ rotate }}>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-center">See What You Want to See</h1>
      </motion.div>
      <p className="mx-auto mt-4 max-w-2xl text-center text-neutral-300">The meme coin that turns your brain’s pattern‑recognition glitch into a movement.</p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild size="lg" className="rounded-2xl"><a href={LINKS.dex} target="_blank" rel="noreferrer">Buy Token <ExternalLink className="ml-2 h-4 w-4" /></a></Button>
        <Button asChild variant="secondary" size="lg" className="rounded-2xl"><a href={LINKS.telegram} target="_blank" rel="noreferrer">Join Telegram <Send className="ml-2 h-4 w-4" /></a></Button>
        <Button asChild variant="ghost" size="lg" className="rounded-2xl text-neutral-300 hover:text-white"><a href={LINKS.xCommunity} target="_blank" rel="noreferrer">Join X Community <Twitter className="ml-2 h-4 w-4" /></a></Button>
      </div>
      <div className="mx-auto mt-10 max-w-xl">
        <CopyableAddress address={TOKEN.contract} />
      </div>
    </section>
  );
}

async function tryClipboardWrite(text: string) {
  if (typeof navigator !== "undefined" && (navigator as any).clipboard && window.isSecureContext) {
    await (navigator as any).clipboard.writeText(text);
    return true;
  }
  return false;
}

function execCommandFallback(text: string) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    ta.style.pointerEvents = "none";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    if (!ok) throw new Error("execCommand copy returned false");
    return true;
  } catch (e) {
    return false;
  }
}

function CopyableAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  const [manual, setManual] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const short = useMemo(() => address.slice(0, 6) + "…" + address.slice(-6), [address]);

  useEffect(() => {
    if (manual && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [manual]);

  const handleCopy = async () => {
    setManual(false);
    try {
      const okModern = await tryClipboardWrite(address);
      if (okModern) { setCopied(true); setTimeout(() => setCopied(false), 1400); return; }
    } catch {}
    const okLegacy = execCommandFallback(address);
    if (okLegacy) { setCopied(true); setTimeout(() => setCopied(false), 1400); return; }
    setManual(true);
  };

  return (
    <Card className="bg-white/5 border-white/10 rounded-2xl" data-e2e="copyable-address">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wider text-neutral-400">Contract Address</div>
          <code className="block text-sm sm:text-base text-white/90 break-all">{address}</code>
          {manual && (
            <div className="mt-2 flex items-center gap-2">
              <Input ref={inputRef} readOnly value={address} className="bg-black/30 border-white/20 text-white" aria-label="Contract address manual copy" />
              <Button type="button" variant="outline" className="rounded-2xl border-white/20 text-white hover:bg-white/10" onClick={() => { if (inputRef.current) { inputRef.current.focus(); inputRef.current.select(); } }}>Select</Button>
              <span className="text-xs text-neutral-400">Press Ctrl/Cmd + C</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge className="rounded-full">{TOKEN.chain}</Badge>
          <Button onClick={handleCopy} variant="outline" className="rounded-2xl border-white/20 text-white hover:bg-white/10" aria-live="polite" data-e2e="copy-button">
            {copied ? (<><Check className="mr-2 h-4 w-4" /> Copied</>) : (<><Copy className="mr-2 h-4 w-4" /> Copy</>)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function WhatIs() {
  return (
    <section id="what" className="relative py-20">
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold">What is Pareidolia?</h2>
          <p className="text-neutral-300">Pareidolia is your brain’s habit of finding meaning where there is none — faces in clouds, animals in coffee foam, words in static noise. We turned this universal, weirdly emotional experience into a meme coin.</p>
          <ul className="list-disc pl-5 text-neutral-300 space-y-2">
            <li>See faces in objects</li>
            <li>Hear words in random noise</li>
            <li>Spot patterns in market chaos</li>
          </ul>
        </div>
        <PatternMosaic />
      </div>
    </section>
  );
}

function PatternMosaic() {
  const tiles = new Array(12).fill(0);
  return (
    <div className="grid grid-cols-3 gap-3">
      {tiles.map((_, i) => (
        <motion.div key={i} className="aspect-square rounded-2xl bg-gradient-to-br from-cyan-500/20 via-fuchsia-500/20 to-amber-400/20 border border-white/10" animate={{ borderRadius: ["1rem", "30%", "50%", "1rem"], scale: [1, 1.02, 0.98, 1] }} transition={{ duration: 4 + (i % 3), repeat: Infinity, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

function TokenOverview() {
  return (
    <section id="token" className="relative py-20">
      <div className="mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Token Overview</h2>
        <p className="mt-2 text-neutral-300">Quick facts and links.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <TokenStat label="Chain" value={TOKEN.chain} />
        <TokenStat label="Ticker" value={TOKEN.ticker} />
        <TokenStat label="Supply" value={TOKEN.supply} />
      </div>
      <div className="mt-6"><CopyableAddress address={TOKEN.contract} /></div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="rounded-2xl"><a href={LINKS.dex} target="_blank" rel="noreferrer">Buy on DEX <ExternalLink className="ml-2 h-4 w-4" /></a></Button>
        <Button asChild variant="outline" className="rounded-2xl border-white/20 text-white hover:bg-white/10"><a href={LINKS.explorer} target="_blank" rel="noreferrer">View on Explorer <ExternalLink className="ml-2 h-4 w-4" /></a></Button>
        <Button asChild variant="ghost" className="rounded-2xl text-neutral-300 hover:text-white"><a href={LINKS.xCommunity} target="_blank" rel="noreferrer">X Community <Twitter className="ml-2 h-4 w-4" /></a></Button>
        <Button asChild variant="secondary" className="rounded-2xl"><a href={LINKS.telegram} target="_blank" rel="noreferrer">Telegram <Send className="ml-2 h-4 w-4" /></a></Button>
      </div>
    </section>
  );
}

function TokenStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-2xl bg-white/5 border-white/10">
      <CardHeader><CardTitle className="text-sm font-medium text-neutral-400">{label}</CardTitle></CardHeader>
      <CardContent><div className="text-xl font-semibold">{value}</div></CardContent>
    </Card>
  );
}

function WhyNow() {
  return (
    <section id="why" className="relative py-20">
      <div className="grid items-start gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold">Why now?</h2>
          <p className="text-neutral-300">Recently, Pasquale D’Silva — a rising artist and the mind behind the $SPARK token (<span className="whitespace-nowrap">~$50M market cap</span>) — posted about Pareidolia. The topic is hot, relatable, and ripe for viral growth. PAREIDOLIA blends psychology, art, and crypto hype into one memetic wave.</p>
          <ul className="list-disc pl-5 text-neutral-300 space-y-2">
            <li>Culturally familiar: everyone experiences it</li>
            <li>Emotionally sticky: sparks strong reactions</li>
            <li>Infinitely memeable visuals & prompts</li>
          </ul>
        </div>
        <CalloutCard />
      </div>
    </section>
  );
}

function CalloutCard() {
  return (
    <Card className="rounded-2xl bg-gradient-to-br from-cyan-500/10 via-fuchsia-500/10 to-amber-400/10 border-white/10">
      <CardHeader><CardTitle className="flex items-center gap-2">Patterns in chaos <LinkIcon className="h-4 w-4" /></CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-neutral-300">If you’ve ever seen a face in your toast or an animal in the clouds — you’ve experienced Pareidolia. We’re turning that shared moment into a community and a joke (that might just go places).</p>
        <div className="flex flex-wrap gap-2">
          <Badge className="rounded-full">#facesineverything</Badge>
          <Badge className="rounded-full">#pareidolia</Badge>
          <Badge className="rounded-full">#patternrecognition</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function Roadmap() {
  const phases = [
    { title: "Phase 1 – First Faces", points: ["Launch PAREIDOLIA & seed early memes", "Establish Telegram & X Community", "List on DEX + publish CA"] },
    { title: "Phase 2 – Pattern Surge", points: ["X-driven visual prompts and threads", "Collabs with artists & memers", "Weekly recognition challenges"] },
    { title: "Phase 3 – Global Vision", points: ["Cross-community partnerships", "IRL pareidolia scavenger hunts", "Bigger meme contests & cultural takeover"] },
  ];
  return (
    <section id="roadmap" className="relative py-20">
      <div className="mb-8 text-center"><h2 className="text-2xl sm:text-3xl font-bold">Roadmap – Pattern Recognition</h2><p className="mt-2 text-neutral-300">We advance as the patterns emerge.</p></div>
      <div className="grid gap-6 md:grid-cols-3">
        {phases.map((p, i) => (
          <Card key={i} className="rounded-2xl bg-white/5 border-white/10">
            <CardHeader><CardTitle>{p.title}</CardTitle></CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-neutral-300 space-y-2">
                {p.points.map((pt, j) => (<li key={j}>{pt}</li>))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function JoinUs() {
  return (
    <section id="join" className="relative py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Join us</h2>
        <p className="mt-3 text-neutral-300">The fun isn’t on the website — it’s in the community. Join our X group and Telegram to see what everyone else is seeing… and maybe spot patterns no one else noticed.</p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-2xl"><a href={LINKS.telegram} target="_blank" rel="noreferrer">Join Telegram <Send className="ml-2 h-4 w-4" /></a></Button>
          <Button asChild variant="secondary" size="lg" className="rounded-2xl"><a href={LINKS.xCommunity} target="_blank" rel="noreferrer">Join X Community <Twitter className="ml-2 h-4 w-4" /></a></Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative mt-10 border-t border-white/5 bg-neutral-950/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-neutral-400">© {new Date().getFullYear()} PAREIDOLIA</div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="rounded-2xl border-white/20 text-white hover:bg-white/10"><a href={LINKS.dex} target="_blank" rel="noreferrer">Buy <ExternalLink className="ml-2 h-4 w-4" /></a></Button>
          <Button asChild variant="ghost" className="rounded-2xl text-neutral-300 hover:text-white"><a href={LINKS.xCommunity} target="_blank" rel="noreferrer">X <Twitter className="ml-2 h-4 w-4" /></a></Button>
          <Button asChild variant="ghost" className="rounded-2xl text-neutral-300 hover:text-white"><a href={LINKS.telegram} target="_blank" rel="noreferrer">Telegram <Send className="ml-2 h-4 w-4" /></a></Button>
        </div>
      </div>
    </footer>
  );
}

function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08),transparent_60%)]" />
      <Blob className="left-[-10%] top-[-10%]" delay={0} />
      <Blob className="right-[-15%] bottom-[-15%]" delay={8} />
      <PareidoliaEyes />
      <GridNoise />
    </div>
  );
}

function Blob({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div className={`absolute h-[42vmax] w-[42vmax] rounded-[40%] bg-gradient-to-tr from-fuchsia-500/20 via-cyan-500/20 to-amber-400/20 blur-3xl ${className}`} animate={{ borderRadius: ["40%", "45% 35% 50% 40%", "50%", "35% 55% 45% 60%", "40%"], x: [0, 50, -40, 30, 0], y: [0, -30, 40, -20, 0] }} transition={{ duration: 24, ease: "easeInOut", repeat: Infinity, delay }} />
  );
}

function GridNoise() { return (<div className="absolute inset-0 opacity-[0.08] [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)]" />); }

function PareidoliaEyes() {
  return (
    <div className="absolute left-1/2 top-[28%] -translate-x-1/2">
      <motion.div className="h-24 w-[44rem] max-w-[90vw]" animate={{ opacity: [0, 0.25, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}>
        <svg viewBox="0 0 880 120" className="h-full w-full">
          <path d="M20,80 Q440,-40 860,80" stroke="rgba(255,255,255,0.25)" strokeWidth="2" fill="none" />
          <path d="M20,100 Q440,-20 860,100" stroke="rgba(255,255,255,0.18)" strokeWidth="2" fill="none" />
        </svg>
      </motion.div>
    </div>
  );
}

function EasterEggFace() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 20000);
    const t2 = setTimeout(() => setShow(false), 26000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 -z-0 flex items-center justify-center">
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 0.15 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="relative h-[40vmin] w-[40vmin]">
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <circle cx="100" cy="100" r="95" fill="none" stroke="white" strokeOpacity="0.35" />
          <circle cx="70" cy="90" r="10" fill="white" fillOpacity="0.35" />
          <circle cx="130" cy="90" r="10" fill="white" fillOpacity="0.35" />
          <path d="M60,130 Q100,155 140,130" stroke="white" strokeOpacity="0.35" fill="none" strokeWidth="4" />
        </svg>
      </motion.div>
    </div>
  );
}

function DevTests() {
  return (
    <section className="relative py-10">
      <div className="mb-4 text-sm text-neutral-400">DEV TESTS (set __SHOW_TESTS__ = true to display)</div>
      <CopyableAddress address="TEST-ADDRESS-1234567890" />
    </section>
  );
}
```
