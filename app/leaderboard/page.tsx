import fs from "fs";
import path from "path";
import { readJson, repoDataPath } from "@/lib/fs-data";
import type { Snapshot } from "@/lib/types";

function listRecentSnapshotFiles(days = 14) {
  const dir = repoDataPath("data/snapshots");
  let files: string[] = [];
  try { files = fs.readdirSync(dir); } catch {}
  const dated = files
    .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort()               // növekvő dátum
    .slice(-days);
  return dated.map(f => ({ date: f.slice(0,10), path: path.join(dir, f) }));
}

function score(m: { like:number; retweet:number; reply:number; quote:number }) {
  return m.like + 2*m.retweet + 2*m.quote + 0.5*m.reply;
}

export default function LeaderboardPage() {
  const snaps = listRecentSnapshotFiles(14).map(({date, path}) => {
    const s = readJson<Snapshot>(path, { date, metrics: {} });
    return s;
  });

  if (snaps.length === 0) {
    return <div className="mx-auto max-w-3xl p-8">No snapshots yet.</div>;
  }

  const today = snaps[snaps.length - 1];
  const yesterday = snaps.length >= 2 ? snaps[snaps.length - 2] : null;

  // mai rangsor
  const entries = Object.entries(today.metrics).map(([id, m]) => ({
    id, score: score(m), m
  })).sort((a,b)=>b.score - a.score);

  // tegnapi helyezések
  const yRank = new Map<string, number>();
  if (yesterday) {
    const yEntries = Object.entries(yesterday.metrics).map(([id, m]) => ({ id, score: score(m) }))
      .sort((a,b)=>b.score - a.score);
    yEntries.forEach((e, i) => yRank.set(e.id, i+1));
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">Top Memes (last 14 days)</h1>
      <p className="text-neutral-400 mt-1">Ranking by weighted engagement. Δ shows change vs yesterday.</p>
      <table className="w-full text-sm mt-6">
        <thead>
          <tr className="text-left text-neutral-400">
            <th className="py-2">#</th>
            <th>ID</th>
            <th>Score</th>
            <th>Δ</th>
          </tr>
        </thead>
        <tbody>
          {entries.slice(0,20).map((e, i) => {
            const rank = i+1;
            const prev = yRank.get(e.id);
            const delta = prev ? (prev - rank) : 0; // pozitív = feljebb
            const deltaStr = prev ? (delta > 0 ? `↑${delta}` : delta < 0 ? `↓${-delta}` : "—") : "NEW";
            return (
              <tr key={e.id} className="border-t border-white/10">
                <td className="py-2">{rank}</td>
                <td><a href={`/redirect/${e.id}`} className="text-cyan-400 underline">{e.id}</a></td>
                <td>{Math.round(e.score)}</td>
                <td>{deltaStr}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-3 text-xs text-neutral-500">Today: {today.date}{yesterday ? ` • Yesterday: ${yesterday.date}` : ""}</div>
    </div>
  );
}
