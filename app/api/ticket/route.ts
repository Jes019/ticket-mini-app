import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const APPS_SCRIPT_ENDPOINT = process.env.APPS_SCRIPT_ENDPOINT;
    const APPS_SCRIPT_SECRET = process.env.APPS_SCRIPT_SECRET;
    if (!APPS_SCRIPT_ENDPOINT || !APPS_SCRIPT_SECRET) {
      return NextResponse.json({ ok: false, error: "missing_env" }, { status: 500 });
    }

    const payload = await req.json();

    const res = await fetch(APPS_SCRIPT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        secret: APPS_SCRIPT_SECRET,
        route: "typebot_ticket",
      }),
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
