/**
 * Memory shape for Dal.
 */
// force rebuild
export interface DalMemory {
  // Learning progress
  topics_covered: string[];
  last_project: string;
  total_lessons_completed: number;
  
  // Preferences
  preferred_colors: string[];
  nickname: string;
  ai_name: string;
  
  // Personal notes
  important_dates: { [key: string]: string };
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
