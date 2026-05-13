/**
 * Process File API Route
 * Accepts PDF, DOCX, or plain text files.
 * Extracts the text content and returns it as JSON.
 * Uses pdf-parse and mammoth for extraction.
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Only needed for server‑less; Vercel auto‑handles temp files
export const runtime = 'nodejs'; // not edge, we need file system access for temp upload

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    let text = '';

    if (ext === 'txt') {
      text = new TextDecoder().decode(buffer);
    } else if (ext === 'pdf') {
      // pdf-parse works with a buffer
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (ext === 'docx') {
      const mammoth = (await import('mammoth')).default;
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json({ error: `Unsupported file type: .${ext}` }, { status: 400 });
    }

    // Trim and limit length (so we don’t flood the context window)
    const maxChars = 15000;
    if (text.length > maxChars) {
      text = text.slice(0, maxChars) + '\n... (truncated for brevity)';
    }

    return NextResponse.json({
      fileName: file.name,
      text,
    });
  } catch (error: any) {
    console.error('File processing error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process file' }, { status: 500 });
  }
}
