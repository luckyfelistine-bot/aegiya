/**
 * Vercel KV client – persists Byeol's memories for Dal.
 * Safe version: does not crash when environment variables are missing.
 */

import { kv as vercelKv } from '@vercel/kv';

// Check if KV is configured at runtime (including build time)
const isKvConfigured = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// Create a safe wrapper that falls back to no‑op if KV is missing
export const kv = isKvConfigured
  ? vercelKv
  : {
      // Mock all methods used in the app
      get: async () => null,
      set: async () => {},
      setex: async () => {},
      del: async () => {},
      lpush: async () => {},
      lrange: async () => [],
      ltrim: async () => {},
      // Add other methods as needed
    };

// ─── Typed Memory Helpers (unchanged) ───

export interface DalMemory {
  topics_covered: string[];
  last_project: string;
  total_lessons_completed: number;
  preferred_colors: string[];
  nickname: string;
  ai_name: string;
  important_dates: Record<string, string>;
  recent_chat_summary: string;
}

export const defaultMemory: DalMemory = {
  topics_covered: [],
  last_project: '',
  total_lessons_completed: 0,
  preferred_colors: ['pink', 'purple'],
  nickname: 'Dal',
  ai_name: 'Byeol',
  important_dates: {
    start: '2026-01-01',
    birthday: 'June 1st',
  },
  recent_chat_summary: '',
};

export async function getDalMemory(): Promise<DalMemory> {
  try {
    const memory = await kv.get<DalMemory>('dal:memory');
    return memory || { ...defaultMemory };
  } catch {
    return { ...defaultMemory };
  }
}

export async function setDalMemory(memory: Partial<DalMemory>): Promise<void> {
  const existing = await getDalMemory();
  await kv.set('dal:memory', { ...existing, ...memory });
}

export async function addTopic(topic: string): Promise<void> {
  const memory = await getDalMemory();
  if (!memory.topics_covered.includes(topic)) {
    memory.topics_covered.push(topic);
    await setDalMemory({ topics_covered: memory.topics_covered });
  }
}

export async function addChatMessage(role: 'user' | 'assistant', content: string): Promise<void> {
  const key = 'dal:chat_history';
  const history = (await kv.lrange(key, 0, 49)) as { role: string; content: string; ts: number }[];
  history.unshift({ role, content, ts: Date.now() });
  await kv.del(key);
  await kv.lpush(key, ...history.slice(0, 50));
}

export async function getChatHistory(limit = 20): Promise<{ role: string; content: string }[]> {
  const messages = await kv.lrange('dal:chat_history', 0, limit - 1);
  return messages.map((m: any) => ({ role: m.role, content: m.content }));
}

export async function recordLesson(title: string): Promise<void> {
  const memory = await getDalMemory();
  await setDalMemory({
    total_lessons_completed: memory.total_lessons_completed + 1,
    last_project: title,
  });
  await kv.lpush('dal:lessons', { title, completed_at: Date.now() });
}

export async function getStreak(): Promise<number> {
  const lessons = await kv.lrange('dal:lessons', 0, 365);
  if (!lessons.length) return 0;

  const dates = lessons.map((l: any) => new Date(l.completed_at).toDateString());
  const uniqueDates = [...new Set(dates)];

  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
    streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(new Date(uniqueDates[i - 1]).getTime() - 86400000).toDateString();
      if (uniqueDates[i] === prev) streak++;
      else break;
    }
  }
  return streak;
}
