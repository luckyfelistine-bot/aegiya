/**
 * Daily Lesson API
 * Uses Groq to generate a 5‑minute coding micro‑project for Dal.
 * No server storage – the client will cache the lesson per day.
 */

import { NextResponse } from 'next/server';
import { groq, CHAT_MODEL } from '@/lib/groq';
import { buildSystemPrompt } from '@/lib/systemPrompt';

export const runtime = 'edge';

export async function GET() {
  try {
    const systemPrompt = buildSystemPrompt();
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
        { role: 'user', content: lessonPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.8,
    });

    const lesson = completion.choices[0]?.message?.content || '';
    return NextResponse.json({ lesson, date: new Date().toISOString() });
  } catch (error: any) {
    console.error('Daily lesson error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
