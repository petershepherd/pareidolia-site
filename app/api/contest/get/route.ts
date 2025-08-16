// app/api/contest/get/route.ts
import { NextResponse } from "next/server";
import { readContestsFile } from "@/lib/fs-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await readContestsFile();
  return NextResponse.json(data);
}
