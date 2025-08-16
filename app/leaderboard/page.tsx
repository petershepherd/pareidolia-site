// app/leaderboard/page.tsx
import { readJson, repoDataPath } from "@/lib/fs-data";
import { Snapshot, MemeMetrics } from "@/lib/types";
import Link from "next/link";

function ymdUTC(d = new Date(), deltaDays = 0) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  t.setUTCDate(t.getUTCDate() + deltaDays);
  const y = t.getUTCFullYear();
  const m = String(t.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(t.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

// egyszerű pontozás: súlyozott engagement
function score(m: MemeMetrics) {
  return (m.like ?? 0) + 2 * (m.retweet ?? 0) + 2 * (m.reply ?? 0) + 3 * (m.quote ?? 0);
}

export default async function LeaderboardPage() {
  const todayStr = ymdUTC();
  const ydayStr = ymdUTC(new Date(), -1);

  const todayPath = repoDataPath(`data/snapshots/${todayStr}.json`);
  const ydayPath = repoDataPath(`data/snapshots/${ydayStr}.json`);

  // ⬅️ await-oljuk a readJson hívásokat
  const today: Snapshot = await readJson<Snapshot>(todayPath, { date: todayStr, metrics: {} });
  const yesterday: Snapshot = await readJson<Snapshot>(ydayPath, { date: ydayStr, metrics: {} });

  const entries = Object.entries(today.metrics).map(([id, m]) => ({
    id,
    m,
    score: score(m),
  }));

  // tegnapi score-ok gyors eléréshez
  const prevScore = new Map<string, number>(
    Object.entries(yesterday.metrics).map(([id, m]) => [id, score(m)])
  );

  // rendezzük ma szerzett pontok szerint
  entries.sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-neutral-400 mb-6">
          Daily snapshot: <span className="font-mono">{todayStr}</span>
        </p>

        {entries.length === 0 ? (
          <div className="text-neutral-400">No approved entries yet for today.</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Tweet</th>
                  <th className="px-3 py-2 text-right">Likes</th>
                  <th className="px-3 py-2 text-right">Retweets</th>
                  <th className="px-3 py-2 text-right">Replies</th>
                  <th className="px-3 py-2 text-right">Quotes</th>
                  <th className="px-3 py-2 text-right">Score</th>
                  <th className="px-3 py-2 text-right">Δ vs yesterday</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, idx) => {
                  const delta = e.score - (prevScore.get(e.id) ?? 0);
                  const url = `https://x.com/i/web/status/${e.id.replace(/^tw-/, "")}`;
                  return (
                    <tr key={e.id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="px-3 py-2">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <Link href={url} target="_blank" className="text-cyan-300 hover:underline">
                          {e.id}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-right">{e.m.like ?? 0}</td>
                      <td className="px-3 py-2 text-right">{e.m.retweet ?? 0}</td>
                      <td className="px-3 py-2 text-right">{e.m.reply ?? 0}</td>
                      <td className="px-3 py-2 text-right">{e.m.quote ?? 0}</td>
                      <td className="px-3 py-2 text-right font-semibold">{e.score}</td>
                      <td className={`px-3 py-2 text-right ${delta === 0 ? "text-neutral-400" : delta > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {delta > 0 ? `+${delta}` : delta}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-neutral-500 mt-3">
          Score = likes + 2×retweets + 2×replies + 3×quotes. Yesterday comparison uses yesterday’s snapshot if available.
        </p>
      </div>
    </div>
  );
}
