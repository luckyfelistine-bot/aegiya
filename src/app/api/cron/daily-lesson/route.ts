import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { groq, CHAT_MODEL } from '@/lib/groq';
import { buildSystemPrompt } from '@/lib/systemPrompt';
import { defaultMemory, DalMemory } from '@/lib/systemPrompt';

export async function GET() {
  try {
    const memory: DalMemory = (await kv.get('dal-memory')) || defaultMemory;
    const systemPrompt = buildSystemPrompt(undefined, memory);

    const lessonPrompt = `Generate today's coding micro-lesson for Dal. She is a beginner learning HTML/CSS/JS.
      Structure your response EXACTLY like this:
      **Title**: [catchy title]
      **Concepts**: [list of concepts covered]
      **Instructions**: [brief, encouraging step‑by‑step]
      **Starter Code**: [full HTML/CSS/JS code block, ready to run]
      **Challenge**: [a small extension task]

      Make it fun, gentle, and warm. Use pink and purple colors in the example if possible.`;

    const completion = await groq.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: lessonPrompt },
      ],
      max_tokens: 1500,
      temperature: 0.8,
    });

    const lesson = completion.choices[0]?.message?.content || '';

    // Store lesson for the day
    await kv.set('daily-lesson', {
      lesson,
      date: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
