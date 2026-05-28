import crypto from "node:crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const secret = (process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || "").trim();
  if (!secret) {
    return NextResponse.json({ detail: "Missing LEMON_SQUEEZY_WEBHOOK_SECRET" }, { status: 400 });
  }

  const payload = await req.text();
  const signature = (req.headers.get("x-signature") || "").trim();
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  if (!signature || signature !== expected) {
    return NextResponse.json({ detail: "Invalid webhook signature" }, { status: 400 });
  }

  let eventName = "unknown";
  try {
    const json = JSON.parse(payload);
    eventName = String(json?.meta?.event_name || "unknown");
  } catch {
    return NextResponse.json({ detail: "Invalid webhook payload" }, { status: 400 });
  }

  // Frontend deployment webhook validation endpoint.
  // Subscription-state persistence is handled by the backend API deployment when configured.
  return NextResponse.json({ received: true, event: eventName });
}
