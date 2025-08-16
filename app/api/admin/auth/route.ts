import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { pin } = await req.json();

    const expected = process.env.ADMIN_PIN;
    if (!expected) {
      return NextResponse.json({ ok: false, error: "ADMIN_PIN missing" }, { status: 500 });
    }

    if (typeof pin !== "string" || pin.length < 4) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Egyszerű összehasonlítás; ha szeretnéd, itt csinálhatunk időzített, timing-safe compare-t is.
    const ok = pin === expected;

    return NextResponse.json({ ok }, { status: ok ? 200 : 401 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
