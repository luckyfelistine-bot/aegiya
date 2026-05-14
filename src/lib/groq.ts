import Groq from "groq-sdk";

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export const groq = groqClient;

export const CHAT_MODEL = GROQ_MODELS.DEFAULT;

export const GROQ_MODELS = {
  DEFAULT: "llama-3.1-70b-versatile",
  FAST: "mixtral-8x7b-32768",
  REASONING: "deepseek-r1-distill-llama-70b",
} as const;

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

// Retry wrapper with exponential backoff
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
