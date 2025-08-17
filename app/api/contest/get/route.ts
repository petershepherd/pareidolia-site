// app/api/contest/get/route.ts
import { NextResponse } from "next/server";
import { readJson, repoDataPath } from "@/lib/fs-data";
import type { Contest, ContestFile } from "@/components/contest/types";

// For backward compatibility with simplified contest format in storage
type StoredContest = {
  id: string;
  title: string;
  start: string;
  end: string;
  images: string[]; // URLs only
  tweetTemplate?: string;
};
type ContestDB = { contests: StoredContest[] };

// Convert stored format to full format expected by frontend
function convertToFullContest(stored: StoredContest): Contest {
  return {
    ...stored,
    activeFrom: stored.start, // Map start -> activeFrom
    activeTo: stored.end,     // Map end -> activeTo
    images: stored.images.map(url => ({ url })), // Convert string[] to ContestImage[]
  };
}

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

  // Convert stored contests to the format expected by frontend
  const contests = (db.contests || []).map((c) => {
    const start = normalizeYMD(c.start);
    const end = normalizeYMD(c.end);
    const normalizedStored: StoredContest = { 
      ...c, 
      start: start ?? "", 
      end: end ?? "" 
    };
    return convertToFullContest(normalizedStored);
  });

  // Return in ContestFile format expected by frontend
  const response: ContestFile = {
    contests,
    submissions: [], // Empty for now
  };

  return NextResponse.json(
    response,
    { headers: { "Cache-Control": "no-store" } }
  );
}
