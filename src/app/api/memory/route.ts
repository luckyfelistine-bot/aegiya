/**
 * Memory API
 * GET: Load all memories for Dal
 * POST: Update memories (topics, last lesson, preferences)
 */

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

const MEMORY_KEY = 'dal-memory';

export async function GET() {
  const memory = await kv.get(MEMORY_KEY);
  return NextResponse.json(memory || {});
}

export async function POST(req: NextRequest) {
  const updates = await req.json();
  // Merge with existing memory
  const current = (await kv.get(MEMORY_KEY)) || {};
  const merged = { ...current, ...updates };
  await kv.set(MEMORY_KEY, merged);
  return NextResponse.json(merged);
}
