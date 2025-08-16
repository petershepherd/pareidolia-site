import { NextResponse } from "next/server";

type Tweet = {
  id: string;
  created_at: string;
  public_metrics: { like_count: number; retweet_count: number; reply_count: number; quote_count: number };
  author_id?: string;
};

const SCORE = (t: Tweet) =>
  t.public_metrics.like_count * 1 +
  t.public_metrics.retweet_count * 2 +
  t.public_metrics.reply_count * 2 +
  t.public_metrics.quote_count * 3;

export async function GET() {
  try {
    // 1) load submissions
    const owner = process.env.CONTEST_REPO_OWNER!;
    const repo = process.env.CONTEST_REPO_NAME!;
    const path = process.env.CONTEST_REPO_FILE_PATH!;
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
    const cfg = await (await fetch(url, { cache: "no-store" })).json();

    const ids: string[] = Array.from(new Set((cfg.submissions || []).map((s: any) => s.tweetId))).slice(0, 100);

    if (ids.length === 0) return NextResponse.json({ items: [] });

    // 2) fetch from X API v2 (chunks of 100)
    const token = process.env.X_BEARER_TOKEN!;
    const api = `https://api.x.com/2/tweets?ids=${ids.join(",")}&tweet.fields=created_at,public_metrics,author_id`;
    const r = await fetch(api, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) {
      const text = await r.text();
      return NextResponse.json({ error: `X API failed: ${r.status} ${text}` }, { status: 502 });
    }
    const data = await r.json();
    const tweets: Tweet[] = data?.data || [];

    // 3) 14 napos szűrés
    const now = Date.now();
    const maxAge = 14 * 24 * 60 * 60 * 1000;
    const recent = tweets.filter((t) => now - new Date(t.created_at).getTime() <= maxAge);

    // 4) pontszám, rendezés, top 20
    const ranked = recent
      .map((t) => ({ id: t.id, created_at: t.created_at, metrics: t.public_metrics, score: SCORE(t) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    return NextResponse.json({ items: ranked }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
