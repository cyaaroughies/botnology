import { NextResponse } from "next/server";

export async function GET() {
  const hasBackendTarget = Boolean(
    (process.env.BOTNOLOGY_CHAT_ENDPOINT || process.env.BOTNOLOGY_API_BASE_URL || process.env.NEXT_PUBLIC_BOTNOLOGY_API_BASE_URL || "").trim()
  );

  return NextResponse.json({
    status: "ok",
    service: "frontend-proxy",
    backend_target_configured: hasBackendTarget,
  });
}
