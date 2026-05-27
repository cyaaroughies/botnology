import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { courseId } = await req.json();
  // TODO: save to your DB
  return NextResponse.json({ success: true, courseId });
}
