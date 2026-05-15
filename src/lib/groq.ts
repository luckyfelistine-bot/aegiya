import Groq from "groq-sdk";

const isBrowser = typeof window !== "undefined";

export const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY || "",
  dangerouslyAllowBrowser: isBrowser,
});

export const GROQ_MODELS = {
  DEFAULT: "llama-3.3-70b-versatile",
  FAST: "llama-3.1-8b-instant",
} as const;

export const CHAT_MODEL = GROQ_MODELS.DEFAULT;

export async function chatCompletion({
  messages,
  model = GROQ_MODELS.DEFAULT,
  temperature = 0.7,
  maxTokens = 4096,
}: {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  return groq.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  });
}

export async function streamChat(messages: any[], model = GROQ_MODELS.DEFAULT) {
  return groq.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    max_tokens: 4096,
    stream: true,
  });
}

export async function quickChat(prompt: string, model = GROQ_MODELS.FAST) {
  const response = await groq.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1024,
  });
  return response.choices[0]?.message?.content || "";
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, delay * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
}
