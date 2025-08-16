"use client";

import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Contest = {
  id: string;
  title: string;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  images: string[];
  tweetTemplate?: string;
};

type ContestDB = {
  contests: Contest[];
};

function ymdUTC(d = new Date()) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const y = t.getUTCFullYear();
  const m = String(t.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(t.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminContestPage() {
  const { publicKey, connected } = useWallet();
  const [pin, setPin] = React.useState("");
  const [items, setItems] = React.useState<Contest[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);

  // betöltjük a meglévő contest listát
  React.useEffect(() => {
    let gone = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/contest/get", { cache: "no-store" });
        if (!res.ok) throw new Error(`GET /api/contest/get failed: ${res.status}`);
        const db: ContestDB = await res.json();
        if (!gone) setItems(db?.contests || []);
      } catch (e: any) {
        if (!gone) setError(e?.message || "Failed to load contests");
      } finally {
        if (!gone) setLoading(false);
      }
    })();
    return () => { gone = true; };
  }, []);

  const addContest = () => {
    const today = ymdUTC();
    const newItem: Contest = {
      id: `ct-${today}-${Math.random().toString(36).slice(2, 8)}`,
      title: "",
      start: today,
      end: today,
      images: [""], // adjunk első üres mezőt
      tweetTemplate: "",
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeContest = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateField = (idx: number, key: keyof Contest, value: string) => {
    setItems((prev) => {
      const next = [...prev];
      (next[idx] as any)[key] = value;
      if (key === "title" && !next[idx].id) {
        next[idx].id = `ct-${slugify(value)}-${Math.random().toString(36).slice(2, 6)}`;
      }
      return next;
    });
  };

  const addImage = (idx: number) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx].images = [...(next[idx].images || []), ""];
      return next;
    });
  };

  const updateImage = (cIdx: number, iIdx: number, url: string) => {
    setItems((prev) => {
      const next = [...prev];
      const imgs = [...(next[cIdx].images || [])];
      imgs[iIdx] = url;
      next[cIdx].images = imgs;
      return next;
    });
  };

  const removeImage = (cIdx: number, iIdx: number) => {
    setItems((prev) => {
      const next = [...prev];
      next[cIdx].images = (next[cIdx].images || []).filter((_, j) => j !== iIdx);
      if (next[cIdx].images.length === 0) next[cIdx].images = [""];
      return next;
    });
  };

  const onSave = async () => {
    setError(null);
    setOkMsg(null);

    if (!connected || !publicKey) {
      setError("Connect the admin wallet first.");
      return;
    }
    if (!pin.trim()) {
      setError("Enter the admin PIN.");
      return;
    }

    // minimális validáció: cím, dátum, legalább 1 kép (nem üres)
    for (const c of items) {
      if (!c.title.trim()) return setError("Each contest needs a title.");
      if (!c.start || !c.end) return setError("Each contest needs start and end dates.");
      const imgs = (c.images || []).filter(Boolean);
      if (imgs.length === 0) return setError("Each contest needs at least one image URL.");
    }

    try {
      setSaving(true);
      const res = await fetch("/api/contest/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          pin: pin.trim(),
          contests: items,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Save failed: ${res.status}`);
      }
      setOkMsg("Saved to GitHub.");
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-2">Admin — Meme Contest</h1>
        <p className="text-neutral-400 mb-6">
          Create or edit daily/weekly image prompts for the meme contest.
        </p>

        <Card className="bg-white/5 border-white/10 rounded-2xl mb-6">
          <CardHeader>
            <CardTitle>Admin Auth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-400">Connected wallet</label>
                <Input
                  value={publicKey ? publicKey.toBase58() : "— not connected —"}
                  readOnly
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400">Admin PIN</label>
                <Input
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter admin PIN"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button onClick={onSave} disabled={saving}>
                {saving ? "Saving…" : "Save to GitHub"}
              </Button>
            </div>
            {error && <div className="text-sm text-rose-400">{error}</div>}
            {okMsg && <div className="text-sm text-emerald-400">{okMsg}</div>}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Contests</h2>
          <Button variant="secondary" onClick={addContest}>+ Add Contest</Button>
        </div>

        {loading ? (
          <div className="text-neutral-400">Loading…</div>
        ) : (
          <div className="space-y-6">
            {items.map((c, idx) => (
              <Card key={c.id || idx} className="bg-white/5 border-white/10 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{c.title || "(untitled)"} <span className="text-xs text-neutral-400 ml-2">{c.id}</span></span>
                    <Button variant="destructive" onClick={() => removeContest(idx)}>Delete Contest</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-neutral-400">Title</label>
                      <Input value={c.title} onChange={(e) => updateField(idx, "title", e.target.value)} placeholder="Contest title" />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400">ID (optional)</label>
                      <Input value={c.id} onChange={(e) => updateField(idx, "id", e.target.value)} placeholder="ct-my-slug-xxxx" />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400">Start (YYYY-MM-DD)</label>
                      <Input type="date" value={c.start} onChange={(e) => updateField(idx, "start", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400">End (YYYY-MM-DD)</label>
                      <Input type="date" value={c.end} onChange={(e) => updateField(idx, "end", e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-neutral-400">Tweet template (optional)</label>
                    <Input
                      value={c.tweetTemplate || ""}
                      onChange={(e) => updateField(idx, "tweetTemplate", e.target.value)}
                      placeholder="E.g. 'New PAREIDOLIA meme contest — use the image below and tag @pareidolia_SOL'"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-300">Images</span>
                      <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => addImage(idx)}>+ Image</Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {(c.images || []).map((url, iIdx) => (
                        <div key={`${idx}-${iIdx}`} className="flex items-center gap-2">
                          <Input
                            value={url}
                            onChange={(e) => updateImage(idx, iIdx, e.target.value)}
                            placeholder="https://… (image url)"
                          />
                          <Button variant="destructive" onClick={() => removeImage(idx, iIdx)}>Remove</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
