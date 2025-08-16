import { NextRequest, NextResponse } from "next/server";
import { readJson, repoDataPath } from "@/lib/fs-data";
import { MemeData, MemeMetrics, Snapshot } from "@/lib/types";
import { githubWriteFile } from "@/lib/github";

function isAdmin(wallet: string | undefined, pin: string | undefined) {
  const wl = (process.env.ADMIN_WALLETS || "").split(",").map(s => s.trim()).filter(Boolean);
  return !!wallet && !!pin && wl.includes(wallet) && pin === process.env.ADMIN_PIN;
}

function today() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export async function POST(req: NextRequest) {
  try {
    const { wallet, pin, updates } = await req.json();
    if (!isAdmin(wallet, pin)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dataPath = repoDataPath("data/memes.json");
    const db = readJson<MemeData>(dataPath, { submissions: [] });

    // apply updates
    const map = new Map(db.submissions.map(s => [s.id, s]));
    for (const u of updates as Array<{ id: string; approved?: boolean; metrics?: Partial<MemeMetrics> }>) {
      const s = map.get(u.id);
      if (!s) continue;
      if (typeof u.approved === "boolean") s.approved = u.approved;
      if (u.metrics) {
        s.metrics.like = u.metrics.like ?? s.metrics.like;
        s.metrics.retweet = u.metrics.retweet ?? s.metrics.retweet;
        s.metrics.reply = u.metrics.reply ?? s.metrics.reply;
        s.metrics.quote = u.metrics.quote ?? s.metrics.quote;
      }
    }

    const next: MemeData = { submissions: Array.from(map.values()) };

    // write memes.json
    await githubWriteFile({
      repo: process.env.GITHUB_REPO!,
      branch: process.env.GITHUB_BRANCH || "main",
      token: process.env.GITHUB_TOKEN!,
      path: "data/memes.json",
      message: `chore(memes): admin update ${updates?.length || 0} items`,
      content: JSON.stringify(next, null, 2)
    });

    // write daily snapshot (approved only)
    const d = today();
    const snap: Snapshot = {
      date: d,
      metrics: Object.fromEntries(
        next.submissions
          .filter(s => s.approved)
          .map(s => [s.id, s.metrics])
      )
    };

    await githubWriteFile({
      repo: process.env.GITHUB_REPO!,
      branch: process.env.GITHUB_BRANCH || "main",
      token: process.env.GITHUB_TOKEN!,
      path: `data/snapshots/${d}.json`,
      message: `chore(snapshots): ${d}`,
      content: JSON.stringify(snap, null, 2)
    });

    return NextResponse.json({ ok: true, snapshot: d });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "unknown" }, { status: 500 });
  }
}
