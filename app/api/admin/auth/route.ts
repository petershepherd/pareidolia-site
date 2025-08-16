import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { pin } = await req.json();
    const expected = process.env.ADMIN_PIN || "";
    if (!expected) {
      return NextResponse.json({ ok: false, error: "ADMIN_PIN not set" }, { status: 500 });
    }
    if (typeof pin !== "string" || pin.length === 0) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    if (pin === expected) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false }, { status: 401 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
