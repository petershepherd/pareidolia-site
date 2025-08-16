// app/api/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { repoDataPath, readJson } from "@/lib/fs-data";
import { githubWriteFile } from "@/lib/github";
import { MemeData } from "@/lib/types";

// egyszerű URL validátor a tweet linkre
function isValidTweetUrl(url: string) {
  try {
    const u = new URL(url);
    return (
      (u.hostname === "x.com" || u.hostname === "twitter.com") &&
      /^\/[^/]+\/status\/\d+/.test(u.pathname)
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tweetId, tweetUrl, wallet } = await req.json();

    // minimális ellenőrzések
    if (!tweetId && !tweetUrl) {
      return NextResponse.json(
        { error: "tweetId or tweetUrl is required" },
        { status: 400 }
      );
    }

    let id = tweetId ? String(tweetId).trim() : "";
    let url = tweetUrl ? String(tweetUrl).trim() : "";

    // ha nincs külön tweetId, próbáljuk url-ből kibányászni
    if (!id && url && isValidTweetUrl(url)) {
      const m = url.match(/status\/(\d+)/);
      if (m) id = m[1];
    }

    if (!id) {
      return NextResponse.json(
        { error: "Unable to resolve tweetId" },
        { status: 400 }
      );
    }

    if (!url || !isValidTweetUrl(url)) {
      // építsünk normális url-t, ha hiányzik/rossz
      url = `https://x.com/i/web/status/${id}`;
    }

    const dataPath = repoDataPath("data/memes.json");

    // ⬅️ EZ A LÉNYEG: await!
    const db = await readJson<MemeData>(dataPath, { submissions: [] });

    // duplikáció védelem id vagy url alapján
    if (
      db.submissions.some(
        (s) => s.id === `tw-${id}` || s.tweetUrl === url
      )
    ) {
      return NextResponse.json({ ok: true, already: true });
    }

    const item = {
      id: `tw-${id}`,
      tweetUrl: url,
      wallet: wallet ?? "",
      submittedAt: new Date().toISOString(),
      approved: false,
      metrics: { like: 0, retweet: 0, reply: 0, quote: 0 },
    };

    const next: MemeData = {
      submissions: [...db.submissions, item],
    };

    await githubWriteFile({
      repo: process.env.GITHUB_REPO!,
      branch: process.env.GITHUB_BRANCH || "main",
      token: process.env.GITHUB_TOKEN!,
      path: "data/memes.json",
      message: `chore(memes): add ${item.id}`,
      content: JSON.stringify(next, null, 2),
    });

    return NextResponse.json({ ok: true, id: item.id });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "unknown" },
      { status: 500 }
    );
  }
}
