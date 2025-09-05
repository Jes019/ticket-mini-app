import { NextResponse } from "next/server";


export async function GET() {
const APPS_SCRIPT_ENDPOINT = process.env.APPS_SCRIPT_ENDPOINT!;
const url = `${APPS_SCRIPT_ENDPOINT}?route=properties`;


const res = await fetch(url, { method: "GET", cache: "no-store" });
const json = await res.json().catch(() => ({ ok: false, error: "bad_json" }));


return NextResponse.json(json, { status: res.status });
}
