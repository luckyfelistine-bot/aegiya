/**
 * groq.ts
 * Initializes the Groq SDK with your API key from environment variables.
 */

import Groq from 'groq-sdk';

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is not set in environment variables.');
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const CODE_MODEL = 'qwen-2.5-coder-32b';
export const CHAT_MODEL = 'llama-3.3-70b-versatile';
export const WHISPER_MODEL = 'whisper-large-v3';
