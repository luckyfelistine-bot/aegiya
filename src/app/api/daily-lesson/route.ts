import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

export async function GET() {
  try {
    const data = await kv.get('daily-lesson');
    if (!data) {
      return NextResponse.json({ lesson: 'No lesson yet – it will appear tomorrow morning!' });
    }
    return NextResponse.json({ lesson: (data as any).lesson, date: (data as any).date });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
