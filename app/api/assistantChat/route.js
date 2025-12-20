import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, method: "GET" });
}

export async function POST(req) {
  const body = await req.json();
  return NextResponse.json({
    ok: true,
    method: "POST",
    body
  });
}