import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read file text
    const text = await file.text();
    const maxLength = 15000;
    const truncated = text.length > maxLength ? text.slice(0, maxLength) + "\n... [truncated]" : text;

    return NextResponse.json({ text: truncated, filename: file.name });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process file" }, { status: 500 });
  }
}
