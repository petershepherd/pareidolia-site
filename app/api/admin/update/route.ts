// app/api/admin/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readJson } from "@/lib/fs-data";
import { MemeData, MemeMetrics, Snapshot } from "@/lib/types";
import { githubWriteFile } from "@/lib/github";

function isAdmin(wallet: string | undefined, pin: string | undefined) {
  const wl = (process.env.ADMIN_WALLETS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
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
    const body = (await req.json()) as {
      wallet?: string;
      pin?: string;
      updates?: Array<{ id: string; approved?: boolean; metrics?: Partial<MemeMetrics> }>;
    };

    if (!isAdmin(body.wallet, body.pin)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1) Olvasd be a jelenlegi adatbázist (memes.json)
    //   - FIGYELEM: relatív path-ot adunk, mert a readJson saját maga oldja fel a repo gyökeréhez
    const db = await readJson<MemeData>("data/memes.json", { submissions: [] });

    // 2) Térképezd fel a beküldéseket id -> submission
    const map = new Map(db.submissions.map((s) => [s.id, s]));

    // 3) Alkalmazd az updatéket (safe default: üres tömb)
    const updates = Array.isArray(body.updates) ? body.updates : [];
    for (const u of updates) {
      const s = map.get(u.id);
      if (!s) continue;

      if (typeof u.approved === "boolean") {
        s.approved = u.approved;
      }

      // biztos ami biztos: ha nincs metrics mező, inicializáljuk
      if (!s.metrics) {
        s.metrics = { like: 0, retweet: 0, reply: 0, quote: 0 };
      }

      if (u.metrics) {
        s.metrics.like = u.metrics.like ?? s.metrics.like;
        s.metrics.retweet = u.metrics.retweet ?? s.metrics.retweet;
        s.metrics.reply = u.metrics.reply ?? s.metrics.reply;
        s.metrics.quote = u.metrics.quote ?? s.metrics.quote;
      }
    }

    const next: MemeData = { submissions: Array.from(map.values()) };

    // 4) Írd vissza a memes.json-t a GitHub repo-ba
    await githubWriteFile({
      repo: process.env.GITHUB_REPO!,              // pl. "petershepherd/pareidolia-site"
      branch: process.env.GITHUB_BRANCH || "main",
      token: process.env.GITHUB_TOKEN!,
      path: "data/memes.json",
      message: `chore(memes): admin update ${updates.length} items`,
      content: JSON.stringify(next, null, 2),
    });

    // 5) Készíts napi snapshotot (csak az approved tételekről)
    const d = today();
    const snap: Snapshot = {
      date: d,
      metrics: Object.fromEntries(
        next.submissions
          .filter((s) => s.approved)
          .map((s) => [s.id, s.metrics]),
      ),
    };

    await githubWriteFile({
      repo: process.env.GITHUB_REPO!,
      branch: process.env.GITHUB_BRANCH || "main",
      token: process.env.GITHUB_TOKEN!,
      path: `data/snapshots/${d}.json`,
      message: `chore(snapshots): ${d}`,
      content: JSON.stringify(snap, null, 2),
    });

    return NextResponse.json({ ok: true, snapshot: d });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unknown" }, { status: 500 });
  }
}
