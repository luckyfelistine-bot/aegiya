/**
 * groq.ts
 * Initializes the Groq SDK with your API key from environment variables.
 * Upgraded: model constants, error handling, retry logic.
 */

import Groq from 'groq-sdk';

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is not set in environment variables.');
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Model selection — optimized for different tasks
export const CODE_MODEL = 'llama-3.3-70b-versatile';      // Best for code generation
export const CHAT_MODEL = 'llama-3.3-70b-versatile';      // Best for conversation
export const WHISPER_MODEL = 'whisper-large-v3';          // Best for voice transcription
export const FAST_MODEL = 'llama-3.1-8b-instant';        // Fast responses for simple queries

/**
 * Retry wrapper for Groq API calls with exponential backoff.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (err.status === 429 || err.status === 503) {
        await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, i)));
      } else {
        throw err;
      }
    }
  }
  throw lastError;
}
