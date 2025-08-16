import { NextResponse } from "next/server";

export async function GET() {
  try {
    const owner = process.env.CONTEST_REPO_OWNER!;
    const repo = process.env.CONTEST_REPO_NAME!;
    const path = process.env.CONTEST_REPO_FILE_PATH!;
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`Fetch failed: ${r.status}`);
    const json = await r.json();
    return NextResponse.json(json, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
