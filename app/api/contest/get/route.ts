// app/api/contest/get/route.ts
import { NextResponse } from "next/server";
import { readJson, repoDataPath } from "@/lib/fs-data";

// Minimal types
type Contest = {
  id: string;
  title: string;
  start: string;
  end: string;
  activeFrom?: string; // May not exist in old data
  activeTo?: string;   // May not exist in old data
  images: string[];
  tweetTemplate?: string;
};
type ContestDB = { contests: Contest[] };

// Normalize many common date formats to YYYY-MM-DD
function normalizeYMD(input: string | undefined): string | null {
  if (!input) return null;
  const s = String(input).trim();

  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // Replace any non-digit by '-' then compress
  const digits = s.replace(/[^\d]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  // Expect 4-2-2 pieces
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(digits);
  if (!m) return null;

  const y = m[1];
  const mm = String(Number(m[2])).padStart(2, "0");
  const dd = String(Number(m[3])).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

function todayYMDUTC(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function GET() {
  const db: ContestDB = await readJson<ContestDB>("contests.json", { contests: [] });

  // Normalize start/end on the fly and ensure activeFrom/activeTo exist
  const contests = (db.contests || []).map((c) => {
    const start = normalizeYMD(c.start);
    const end = normalizeYMD(c.end);
    return { 
      ...c, 
      start: start ?? "", 
      end: end ?? "",
      // Ensure activeFrom/activeTo exist for backward compatibility
      activeFrom: c.activeFrom || (start ?? ""),
      activeTo: c.activeTo || (end ?? ""),
      // Convert string[] images to ContestImage[] format for frontend compatibility
      images: Array.isArray(c.images) ? c.images.map(url => typeof url === 'string' ? { url, alt: '' } : url) : []
    };
  });

  const today = todayYMDUTC();

  // Pick the first contest where start <= today <= end
  const todaysContest =
    contests.find((c) => c.start && c.end && c.start <= today && today <= c.end) || null;

  return NextResponse.json(
    {
      today,
      contest: todaysContest, // null if none
      contests,               // still return all if your UI lists future ones
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
