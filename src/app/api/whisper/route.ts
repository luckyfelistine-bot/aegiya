/**
 * Whisper API Route
 * Accepts audio blobs (webm, wav) and uses Groq's Whisper model
 * to transcribe them into text. Returns the text as JSON.
 */

import { NextRequest } from 'next/server';
import { groq, WHISPER_MODEL } from '@/lib/groq';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const audioFile = formData.get('audio') as File;

  if (!audioFile) {
    return new Response(JSON.stringify({ error: 'No audio file provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const transcription = await groq.audio.transcriptions.create({
    model: WHISPER_MODEL,
    file: audioFile,
    response_format: 'json',
  });

  return new Response(JSON.stringify({ text: transcription.text }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
