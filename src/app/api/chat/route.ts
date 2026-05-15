import { NextRequest, NextResponse } from "next/server";
import { chatCompletion, CHAT_MODEL } from "@/lib/groq";
import { buildSystemPrompt } from "@/lib/systemPrompt";

export const runtime = "edge";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { messages, model = "llama-3.3-70b-versatile" } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY not configured on server" },
        { status: 500 }
      );
    }

    const systemPrompt = buildSystemPrompt();
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const response = await chatCompletion({
      messages: apiMessages,
      model,
      temperature: 0.7,
      maxTokens: 4096,
    });

    const content = response.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
