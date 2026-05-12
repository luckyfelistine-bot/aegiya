/**
 * Chat API Route
 * Receives messages array from the client, injects the system prompt,
 * and streams the AI's response back as Server-Sent Events.
 */

import { NextRequest } from 'next/server';
import { groq, CODE_MODEL } from '@/lib/groq';
import { buildSystemPrompt } from '@/lib/systemPrompt';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const systemPrompt = buildSystemPrompt();
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const stream = await groq.chat.completions.create({
      model: CODE_MODEL,
      messages: fullMessages,
      stream: true,
      max_tokens: 4096,
      temperature: 0.7,
      top_p: 0.9,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(content)}\n\n`));
          }
          if (chunk.choices[0]?.finish_reason === 'length') {
            controller.enqueue(encoder.encode(`data: [TRUNCATED]\n\n`));
          }
        }
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('CHAT ROUTE ERROR:', error.message, error.status, error.headers);
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
