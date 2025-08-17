// app/api/contest/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readJson, repoDataPath } from "@/lib/fs-data";
import { githubWriteFile } from "@/lib/github";
// ha létrehoztad a közös auth utilt, használd ezt:
import { isAllowedAdminWallet, checkAdminPin } from "@/lib/auth";

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

// --------- Ha NINCS lib/auth.ts, ez a fallback ---------
// (Hagyd bent vagy töröld, ha a közös utilt használod.)
function _isAllowedAdminWallet(wallet?: string): boolean {
  const raw =
    process.env.NEXT_PUBLIC_ALLOWED_ADMIN_WALLETS ||
    process.env.ADMIN_WALLETS || ""; // régi fallback
  const set = new Set(
    raw.split(",").map(s => s.trim()).filter(Boolean)
  );
  return !!wallet && set.has(wallet); // pontos (case-sensitive) egyezés
}
function _checkAdminPin(pin?: string): boolean {
  return !!pin && pin === (process.env.ADMIN_PIN || "");
}
// --------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const wallet: string | undefined = body?.wallet?.trim();
    const pin: string | undefined = body?.pin?.trim();
    const contests: Contest[] = Array.isArray(body?.contests) ? body.contests : [];

    // közös util preferált, különben fallback
    const allowed =
      typeof isAllowedAdminWallet === "function"
        ? isAllowedAdminWallet(wallet)
        : _isAllowedAdminWallet(wallet);
    const pinOk =
      typeof checkAdminPin === "function"
        ? checkAdminPin(pin)
        : _checkAdminPin(pin);

    if (!wallet) {
      return NextResponse.json(
        { error: "Unauthorized", reason: "missing_wallet" },
        { status: 401 }
      );
    }
    if (!allowed) {
      return NextResponse.json(
        { error: "Unauthorized", reason: "not_allowed_wallet" },
        { status: 401 }
      );
    }
    if (!pinOk) {
      return NextResponse.json(
        { error: "Unauthorized", reason: "wrong_pin" },
        { status: 401 }
      );
    }

    // read existing (or fallback)
    const path = repoDataPath("data/contests.json");
    const db: ContestDB = await readJson<ContestDB>(path, { contests: [] });

    // very light validation + trimming
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

    // overwrite full list (simple admin flow)
    const next: ContestDB = { contests: cleaned };

    // write to GitHub
    await githubWriteFile({
      repo: process.env.GITHUB_REPO!,           // pl. "petershepherd/pareidolia-site"
      branch: process.env.GITHUB_BRANCH || "main",
      token: process.env.GITHUB_TOKEN!,
      path: "data/contests.json",
      message: `chore(contests): update ${cleaned.length} item(s)`,
      content: JSON.stringify(next, null, 2),
    });

    return NextResponse.json({ ok: true, count: cleaned.length, prevCount: db.contests?.length ?? 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unknown" }, { status: 500 });
  }
}
