import { NextResponse } from "next/server";

const VARIANT_KEYS = [
  "LEMON_SQUEEZY_VARIANT_ASSOCIATES_MONTHLY",
  "LEMON_SQUEEZY_VARIANT_ASSOCIATES_ANNUAL",
  "LEMON_SQUEEZY_VARIANT_BACHELORS_MONTHLY",
  "LEMON_SQUEEZY_VARIANT_BACHELORS_ANNUAL",
  "LEMON_SQUEEZY_VARIANT_MASTERS_MONTHLY",
  "LEMON_SQUEEZY_VARIANT_MASTERS_ANNUAL",
] as const;

export async function GET(req: Request) {
  const requiredKeys = ["LEMON_SQUEEZY_API_KEY", "LEMON_SQUEEZY_WEBHOOK_SECRET", ...VARIANT_KEYS];
  const missing = requiredKeys.filter((key) => !(process.env[key] || "").trim());

  return NextResponse.json({
    configured: missing.length === 0,
    missing,
    present: requiredKeys.filter((key) => !missing.includes(key)),
    webhook_url: new URL("/api/lemonsqueezy/webhook", req.url).toString(),
  });
}
