import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
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
}) {
  return groq.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  });
}
