import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const musicDir = path.join(process.cwd(), "public", "music");
  if (!fs.existsSync(musicDir)) {
    return NextResponse.json({ tracks: [] });
  }

  const files = fs
    .readdirSync(musicDir)
    .filter((f) => /\.(mp3|wav|ogg|m4a|flac|webm)$/i.test(f))
    .map((f) => {
      const clean = f.replace(/\.[^/.]+$/, "");
      const parts = clean.split(/\s*[-—]\s*/);
      return {
        id: f,
        title: parts[1]?.trim() || clean,
        artist: parts[0]?.trim() || "Unknown Artist",
        src: `/music/${encodeURIComponent(f)}`,
        filename: f,
      };
    });

  return NextResponse.json({ tracks: files });
}
