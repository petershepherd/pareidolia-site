"use client";
import React, { useState } from "react";

export default function SubmitPage() {
  const [tweetUrl, setTweetUrl] = useState("");
  const [wallet, setWallet] = useState(""); // ha akarsz, ide később wallet connect gombot teszünk
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweetUrl, wallet: wallet || undefined })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      setMsg("Thanks! Your meme was submitted. Awaiting moderation.");
      setTweetUrl("");
    } catch (e:any) {
      setMsg(`Error: ${e.message}`);
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold">Submit your Meme (X post)</h1>
      <p className="text-neutral-400 mt-2">Paste the Tweet URL containing your meme. Moderators will approve it.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <input
          className="w-full rounded-lg bg-white/5 border border-white/10 p-3"
          placeholder="https://x.com/username/status/1234567890"
          value={tweetUrl}
          onChange={(e) => setTweetUrl(e.target.value)}
          required
        />
        <input
          className="w-full rounded-lg bg-white/5 border border-white/10 p-3"
          placeholder="Your wallet (optional)"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
        />
        <button disabled={busy} className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20">
          {busy ? "Submitting..." : "Submit"}
        </button>
      </form>

      {msg && <div className="mt-4 text-sm text-neutral-300">{msg}</div>}
    </div>
  );
}
