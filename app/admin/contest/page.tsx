"use client";

import React, { useEffect, useMemo, useState } from "react";
import { WalletProviders } from "@/components/solana/WalletProviders";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import type { Contest, ContestFile } from "@/components/contest/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

const allowed = (addr?: string | null) => {
  if (!addr) return false;
  const list = (process.env.NEXT_PUBLIC_ALLOWED_ADMIN_WALLETS || "").split(",").map((s) => s.trim());
  return list.some((x) => x && x.toLowerCase() === addr.toLowerCase());
};

export default function AdminContestPage() {
  return (
    <WalletProviders>
      <AdminInner />
    </WalletProviders>
  );
}

function AdminInner() {
  const { publicKey } = useWallet();
  const address = useMemo(() => (publicKey ? publicKey.toBase58() : ""), [publicKey]);

  const [pin, setPin] = useState("");
  const [cfg, setCfg] = useState<ContestFile>({ contests: [], submissions: [] });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const canAdmin = allowed(address);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/contest/get", { cache: "no-store" });
        const j = await r.json();
        setCfg(j);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const addContest = () => {
    const now = new Date();
    const id = `${format(now, "yyyy-MM-dd")}-${Math.random().toString(36).slice(2, 5)}`;
    const c: Contest = {
      id,
      title: "Daily Meme Prompt",
      description: "Make a meme from these image(s) and post to X. Submit the tweet ID below.",
      images: [{ url: "https://example.com/your-image.jpg" }],
      activeFrom: new Date().toISOString(),
      activeTo: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      minSubmissions: 5,
      tweetTemplate: "Seeing faces in things? Join #PAREIDOLIA 💫 https://www.illusionof.life",
    };
    setCfg((c0) => ({ ...c0, contests: [c, ...c0.contests] }));
  };

  const save = async () => {
    setLoading(true); setMsg("");
    try {
      const r = await fetch("/api/contest/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-pin": pin },
        body: JSON.stringify(cfg),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Save failed");
      setMsg("Saved to GitHub ✅");
    } catch (e: any) {
      setMsg(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  if (!canAdmin) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold mb-4">Admin – Meme Contests</h1>
        <p className="text-neutral-400 mb-4">Connect an admin wallet to continue.</p>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin – Meme Contests</h1>
        <WalletMultiButton />
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader><CardTitle>PIN</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-3">
          <Input placeholder="6-char PIN" value={pin} onChange={(e) => setPin(e.target.value)} className="max-w-xs" />
          <Button onClick={save} disabled={loading || pin.length < 6}>{loading ? "Saving..." : "Save to GitHub"}</Button>
          {msg && <span className="text-sm text-neutral-400">{msg}</span>}
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Contests</CardTitle>
          <Button onClick={addContest}>Add Contest</Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {cfg.contests.map((c, idx) => (
            <div key={c.id} className="grid md:grid-cols-2 gap-3 border border-white/10 rounded-xl p-3">
              <div className="space-y-2">
                <label className="text-xs text-neutral-400">ID</label>
                <Input value={c.id} onChange={(e) => update(idx, { id: e.target.value })} />
                <label className="text-xs text-neutral-400">Title</label>
                <Input value={c.title} onChange={(e) => update(idx, { title: e.target.value })} />
                <label className="text-xs text-neutral-400">Description</label>
                <Input value={c.description || ""} onChange={(e) => update(idx, { description: e.target.value })} />
                <label className="text-xs text-neutral-400">Tweet Template</label>
                <Input value={c.tweetTemplate || ""} onChange={(e) => update(idx, { tweetTemplate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-neutral-400">Active From</label>
                <Input type="datetime-local" value={toLocal(c.activeFrom)} onChange={(e) => update(idx, { activeFrom: fromLocal(e.target.value) })} />
                <label className="text-xs text-neutral-400">Active To</label>
                <Input type="datetime-local" value={toLocal(c.activeTo)} onChange={(e) => update(idx, { activeTo: fromLocal(e.target.value) })} />
                <label className="text-xs text-neutral-400">Min Submissions</label>
                <Input type="number" value={c.minSubmissions || 0} onChange={(e) => update(idx, { minSubmissions: Number(e.target.value) })} />
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">Images (URLs)</label>
                  {c.images.map((im, i2) => (
                    <div key={i2} className="flex gap-2">
                      <Input value={im.url} onChange={(e) => updateImage(idx, i2, { url: e.target.value })} />
                      <Button variant="outline" onClick={() => removeImage(idx, i2)}>Del</Button>
                    </div>
                  ))}
                  <Button variant="secondary" onClick={() => addImage(idx)}>+ Image</Button>
                </div>
                <Button variant="destructive" onClick={() => removeContest(idx)}>Delete Contest</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader><CardTitle>Submissions (manual)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-neutral-400">Paste Tweet IDs + choose contest.</p>
          {/* Egyszerű form új submission-hoz */}
          <AddSubmission cfg={cfg} setCfg={setCfg} />
        </CardContent>
      </Card>
    </div>
  );

  function update(index: number, patch: Partial<Contest>) {
    setCfg((c0) => {
      const next = [...c0.contests];
      next[index] = { ...next[index], ...patch };
      return { ...c0, contests: next };
    });
  }
  function addImage(index: number) {
    update(index, { images: [...cfg.contests[index].images, { url: "" }] });
  }
  function updateImage(index: number, imgIdx: number, patch: { url?: string; alt?: string }) {
    setCfg((c0) => {
      const cc = [...c0.contests];
      const imgs = [...cc[index].images];
      imgs[imgIdx] = { ...imgs[imgIdx], ...patch };
      cc[index].images = imgs;
      return { ...c0, contests: cc };
    });
  }
  function removeImage(index: number, imgIdx: number) {
    setCfg((c0) => {
      const cc = [...c0.contests];
      cc[index].images = cc[index].images.filter((_, i) => i !== imgIdx);
      return { ...c0, contests: cc };
    });
  }
  function removeContest(index: number) {
    setCfg((c0) => ({ ...c0, contests: c0.contests.filter((_, i) => i !== index) }));
  }
}

function toLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocal(local: string) {
  return new Date(local).toISOString();
}

function AddSubmission({ cfg, setCfg }: { cfg: any; setCfg: (f: any) => void }) {
  const [contestId, setContestId] = useState<string>("");
  const [tweetUrl, setTweetUrl] = useState<string>("");

  const extractId = (u: string) => {
    // elfogad URL-t vagy nyers ID-t
    const m = u.match(/status\/(\d+)/);
    if (m) return m[1];
    return /^\d+$/.test(u) ? u : "";
  };

  const add = () => {
    const id = extractId(tweetUrl.trim());
    if (!id || !contestId) return;
    setCfg((c0: any) => ({
      ...c0,
      submissions: [{ contestId, tweetId: id }, ...c0.submissions],
    }));
    setTweetUrl("");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <select
        value={contestId}
        onChange={(e) => setContestId(e.target.value)}
        className="bg-black border border-white/10 rounded-xl px-3 py-2"
      >
        <option value="">Choose contest…</option>
        {cfg.contests.map((c: any) => (
          <option key={c.id} value={c.id}>{c.title} ({c.id})</option>
        ))}
      </select>
      <Input placeholder="Tweet URL or ID" value={tweetUrl} onChange={(e) => setTweetUrl(e.target.value)} />
      <Button onClick={add}>Add</Button>
    </div>
  );
}
