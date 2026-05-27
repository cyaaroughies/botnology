import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { courseId } = await req.json();
  // TODO: remove from your DB
  return NextResponse.json({ success: true, courseId });
}
