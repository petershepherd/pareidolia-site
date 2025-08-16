// app/api/contest/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readJson, repoDataPath } from "@/lib/fs-data";
import { githubWriteFile } from "@/lib/github";

type Contest = {
  id: string;
  title: string;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  images: string[];
  tweetTemplate?: string;
};

type ContestDB = {
  contests: Contest[];
};

function isAdmin(wallet: string | undefined, pin: string | undefined) {
  const wl = (process.env.ADMIN_WALLETS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return !!wallet && !!pin && wl.includes(wallet) && pin === process.env.ADMIN_PIN;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const wallet: string | undefined = body?.wallet;
    const pin: string | undefined = body?.pin;
    const contests: Contest[] = Array.isArray(body?.contests) ? body.contests : [];

    if (!isAdmin(wallet, pin)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // read existing (or fallback)
    const path = repoDataPath("data/contests.json");
    const db: ContestDB = await readJson<ContestDB>(path, { contests: [] });

    // very light validation
    const cleaned: Contest[] = contests.map((c) => ({
      id: String(c.id || "").trim(),
      title: String(c.title || "").trim(),
      start: String(c.start || "").trim(),
      end: String(c.end || "").trim(),
      images: (Array.isArray(c.images) ? c.images : [])
        .map((u) => String(u || "").trim())
        .filter(Boolean),
      tweetTemplate: c.tweetTemplate ? String(c.tweetTemplate).trim() : undefined,
    }));

    // overwrite full list (egyszerűbb admin flow)
    const next: ContestDB = { contests: cleaned };

    // write to GitHub
    await githubWriteFile({
      repo: process.env.GITHUB_REPO!,                 // pl. "petershepherd/pareidolia-site"
      branch: process.env.GITHUB_BRANCH || "main",
      token: process.env.GITHUB_TOKEN!,
      path: "data/contests.json",
      message: `chore(contests): update ${cleaned.length} item(s)`,
      content: JSON.stringify(next, null, 2),
    });

    return NextResponse.json({ ok: true, count: cleaned.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unknown" }, { status: 500 });
  }
}
