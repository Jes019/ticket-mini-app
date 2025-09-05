import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const APPS_SCRIPT_ENDPOINT = process.env.APPS_SCRIPT_ENDPOINT;
    if (!APPS_SCRIPT_ENDPOINT) {
      return NextResponse.json({ ok: false, error: "missing_env" }, { status: 500 });
    }
    const { searchParams } = new URL(req.url);
    const property = searchParams.get("property") || "";
    const url = `${APPS_SCRIPT_ENDPOINT}?route=units&property=${encodeURIComponent(property)}`;

    const res = await fetch(url, { method: "GET", cache: "no-store" });
    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
