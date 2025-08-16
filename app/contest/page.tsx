"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Contest, ContestFile } from "@/components/contest/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ContestPage() {
  const [cfg, setCfg] = useState<ContestFile>({ contests: [], submissions: [] });
  const [lb, setLb] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [cR, lR] = await Promise.all([fetch("/api/contest/get", { cache: "no-store" }), fetch("/api/leaderboard", { cache: "no-store" })]);
      const cJ = await cR.json(); const lJ = await lR.json();
      setCfg(cJ); setLb(lJ.items || []);
    })();
  }, []);

  const now = Date.now();
  const active = useMemo(
    () =>
      (cfg.contests || []).filter((c) => {
        const a = new Date(c.activeFrom).getTime();
        const b = new Date(c.activeTo).getTime();
        return now >= a && now <= b;
      }).sort((a, b) => new Date(a.activeFrom).getTime() - new Date(b.activeFrom).getTime()),
    [cfg, now]
  );

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">PAREIDOLIA – Meme Contest</h1>
        <p className="text-neutral-300">Make memes from today’s prompt image(s). Post on X and share in our Telegram memeroom.</p>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader><CardTitle>Today’s Prompt</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {active.length === 0 && <p className="text-neutral-400">No active contest right now. Check back soon!</p>}
            {active.map((c) => (
              <div key={c.id} className="space-y-3">
                <div className="text-lg font-semibold">{c.title}</div>
                {c.description && <p className="text-neutral-300">{c.description}</p>}
                <div className="grid grid-cols-2 gap-3">
                  {c.images.map((im, i) => (
                    <img key={i} src={im.url} alt={im.alt || "prompt"} className="rounded-xl border border-white/10" />
                  ))}
                </div>
                {c.tweetTemplate && (
                  <div className="text-sm text-neutral-400">
                    Suggested caption:&nbsp;
                    <code className="text-neutral-200">{c.tweetTemplate}</code>
                  </div>
                )}
                <div className="text-sm text-neutral-400">
                  Active until: {new Date(c.activeTo).toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <Button asChild><a href="/meme" target="_blank" rel="noreferrer">Open Meme Generator</a></Button>
                  <Button variant="secondary" asChild><a href="https://t.me/pareidoliaportal" target="_blank" rel="noreferrer">Telegram Memeroom</a></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader><CardTitle>Leaderboard (last 14 days)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {lb.length === 0 && <p className="text-neutral-400 text-sm">No ranked entries yet.</p>}
            <ol className="space-y-2">
              {lb.map((x, i) => (
                <li key={x.id} className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 w-6 text-right">{i + 1}.</span>
                    <a className="text-cyan-300 hover:underline" href={`https://x.com/i/status/${x.id}`} target="_blank" rel="noreferrer">
                      Tweet {x.id}
                    </a>
                  </div>
                  <div className="text-sm text-neutral-300">
                    Score: <b>{x.score}</b>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>

      <section className="text-sm text-neutral-400">
        <p>Scoring = likes×1 + reposts×2 + replies×2 + quotes×3. Only tweets from the last 14 days are counted.</p>
      </section>
    </div>
  );
}
