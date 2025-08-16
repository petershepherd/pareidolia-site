// app/api/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readJson } from "@/lib/fs-data";
import { githubWriteFile } from "@/lib/github";
import { MemeData, MemeMetrics } from "@/lib/types";

// minimális validáció
function isValidTweetId(s?: string) {
  return !!s && /^[0-9]+$/.test(s);
}
function normUrl(u?: string) {
  try {
    return u ? new URL(u).toString() : "";
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      id?: string;            // belső azonosító (pl. wallet+tweedId hash) – opcionális
      wallet?: string;        // beküldő tárca (nem kötelező, de hasznos)
      tweetId?: string;       // kötelező (ehhez mérünk engagementet)
      tweetUrl?: string;      // opcionális, UI-hoz
      imageUrl?: string;      // opcionális (ha szeretnéd eltárolni)
      createdAt?: string;     // opcionális (ISO)
    };

    // alap ellenőrzések
    const tweetId = body.tweetId?.trim();
    if (!isValidTweetId(tweetId)) {
      return NextResponse.json({ error: "Invalid tweetId" }, { status: 400 });
    }

    const dataPath = "data/memes.json";
    const db = await readJson<MemeData>(dataPath, { submissions: [] });

    // duplikáció-védelem: ha már van ilyen tweetId, visszaokézzuk (idempotens POST)
    if (db.submissions.some((s) => s.tweetId === tweetId)) {
      return NextResponse.json({ ok: true, already: true });
    }

    // új rekord összeállítása
    const nowIso = new Date().toISOString();
    const id = body.id?.trim() || `${tweetId}`;
    const wallet = body.wallet?.trim() || "";
    const tweetUrl = normUrl(body.tweetUrl) || `https://x.com/i/web/status/${tweetId}`;
    const imageUrl = normUrl(body.imageUrl) || "";

    const metrics: MemeMetrics = { like: 0, retweet: 0, reply: 0, quote: 0 };

    db.submissions.push({
      id,
      tweetId,
      tweetUrl,
      imageUrl,
      wallet,
      createdAt: body.createdAt?.trim() || nowIso,
      approved: false,   // moderáció után lesz true
      metrics,
    });

    // írás GitHub-ba
    await githubWriteFile({
      repo: process.env.GITHUB_REPO!,              // pl. "petershepherd/pareidolia-site"
      branch: process.env.GITHUB_BRANCH || "main",
      token: process.env.GITHUB_TOKEN!,
      path: dataPath,
      message: `chore(memes): add submission ${tweetId}`,
      content: JSON.stringify(db, null, 2),
    });

    return NextResponse.json({ ok: true, id, tweetId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unknown" }, { status: 500 });
  }
}
