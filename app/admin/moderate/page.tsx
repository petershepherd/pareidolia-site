"use client";
import React, { useEffect, useState } from "react";
import type { MemeData, Submission } from "@/lib/types";

export default function ModeratePage() {
  const [data, setData] = useState<MemeData | null>(null);
  const [wallet, setWallet] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [updates, setUpdates] = useState<Record<string, { approved?: boolean; like?: number; retweet?: number; reply?: number; quote?: number }>>({});

  useEffect(() => {
    (async () => {
      const res = await fetch("/memes.json", { cache: "no-store" }).catch(() => null);
      if (!res || !res.ok) return;
      const j = await res.json();
      setData(j);
    })();
  }, []);

  const change = (id: string, patch: Partial<{ approved: boolean; like: number; retweet: number; reply: number; quote: number }>) => {
    setUpdates(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const save = async () => {
    setBusy(true); setMsg(null);
    try {
      const payload = {
        wallet,
        pin,
        updates: Object.entries(updates).map(([id, u]) => ({
          id,
          approved: typeof u.approved === "boolean" ? u.approved : undefined,
          metrics: {
            like: u.like,
            retweet: u.retweet,
            reply: u.reply,
            quote: u.quote
          }
        }))
      };
      const res = await fetch("/api/admin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      setMsg(`Saved. Snapshot: ${j.snapshot}`);
      setUpdates({});
      // refresh list
      const r2 = await fetch("/memes.json", { cache: "no-store" });
      setData(await r2.json());
    } catch (e:any) {
      setMsg(`Error: ${e.message}`);
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Admin – Moderate & Update Metrics</h1>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input className="rounded-lg bg-white/5 border border-white/10 p-3" placeholder="Admin wallet (must match env)" value={wallet} onChange={e=>setWallet(e.target.value)} />
        <input className="rounded-lg bg-white/5 border border-white/10 p-3" placeholder="6-char PIN" value={pin} onChange={e=>setPin(e.target.value)} />
        <button onClick={save} disabled={busy} className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20">{busy ? "Saving..." : "Save & Snapshot"}</button>
      </div>
      {msg && <div className="mt-2 text-sm text-neutral-300">{msg}</div>}

      <div className="mt-6">
        {!data ? "Loading..." : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-400">
                <th className="py-2">Tweet</th>
                <th>Approved</th>
                <th>Like</th><th>RT</th><th>Reply</th><th>Quote</th>
              </tr>
            </thead>
            <tbody>
              {data.submissions.map((s: Submission) => {
                const u = updates[s.id] || {};
                return (
                  <tr key={s.id} className="border-t border-white/10">
                    <td className="py-2 pr-4">
                      <a href={s.tweetUrl} target="_blank" className="text-cyan-400 underline">{s.id}</a>
                    </td>
                    <td>
                      <input type="checkbox"
                        defaultChecked={s.approved}
                        onChange={(e)=>change(s.id, { approved: e.target.checked })}
                      />
                    </td>
                    {(["like","retweet","reply","quote"] as const).map(k=>(
                      <td key={k}>
                        <input type="number" min={0}
                          defaultValue={s.metrics[k]}
                          onChange={(e)=>change(s.id, { [k]: Number(e.target.value) } as any)}
                          className="w-20 rounded bg-white/5 border border-white/10 p-1"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
