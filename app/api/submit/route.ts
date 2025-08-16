import { NextRequest, NextResponse } from "next/server";
import { readJson, repoDataPath } from "@/lib/fs-data";
import { MemeData, Submission } from "@/lib/types";
import { githubWriteFile } from "@/lib/github";

function extractTweetId(url: string) {
  try {
    const u = new URL(url);
    if (!/x\.com|twitter\.com$/i.test(u.hostname.replace(/^www\./, ""))) return null;
    const m = u.pathname.match(/\/status\/(\d+)/);
    return m ? `tw-${m[1]}` : null;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    const { tweetUrl, wallet } = await req.json();
    if (!tweetUrl) return NextResponse.json({ error: "tweetUrl required" }, { status: 400 });
    const id = extractTweetId(tweetUrl);
    if (!id) return NextResponse.json({ error: "Invalid tweet URL" }, { status: 400 });

    const dataPath = repoDataPath("data/memes.json");
    const db = readJson<MemeData>(dataPath, { submissions: [] });

    if (db.submissions.some(s => s.id === id)) {
      return NextResponse.json({ ok: true, already: true });
    }

    const sub: Submission = {
      id,
      tweetUrl,
      wallet,
      submittedAt: new Date().toISOString(),
      approved: false,
      metrics: { like: 0, retweet: 0, reply: 0, quote: 0 }
    };
    const next: MemeData = { submissions: [sub, ...db.submissions] };

    await githubWriteFile({
      repo: process.env.GITHUB_REPO!,
      branch: process.env.GITHUB_BRANCH || "main",
      token: process.env.GITHUB_TOKEN!,
      path: "data/memes.json",
      message: `feat(memes): add submission ${id}`,
      content: JSON.stringify(next, null, 2)
    });

    return NextResponse.json({ ok: true, id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "unknown" }, { status: 500 });
  }
}
