import Groq from "groq-sdk";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const MODELS = {
  CHAT: "llama-3.3-70b-versatile",
  WHISPER: "whisper-large-v3-turbo",
} as const;

// ✅ Add this named export for backward compatibility
export const CHAT_MODEL = MODELS.CHAT;

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (error.status === 429 || error.status >= 500) {
        await new Promise((r) => setTimeout(r, delay * Math.pow(2, i)));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}
