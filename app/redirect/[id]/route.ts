// app/redirect/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // memes.json fájl elérési útja
    const memesPath = path.join(process.cwd(), "data", "memes.json");

    if (!fs.existsSync(memesPath)) {
      return NextResponse.json({ error: "memes.json not found" }, { status: 500 });
    }

    const memesRaw = fs.readFileSync(memesPath, "utf-8");
    const memes = JSON.parse(memesRaw);

    const meme = memes.find((m: any) => String(m.id) === params.id);

    if (!meme) {
      return NextResponse.json({ error: "Meme not found" }, { status: 404 });
    }

    if (!meme.tweetUrl) {
      return NextResponse.json({ error: "Tweet URL missing" }, { status: 400 });
    }

    // Redirect a Tweet-re
    return NextResponse.redirect(meme.tweetUrl, 302);
  } catch (err) {
    console.error("Redirect error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
