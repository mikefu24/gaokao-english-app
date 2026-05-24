// ─── Core data types ────────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Category = 'reading' | 'cloze' | 'grammar' | 'seven_choice';

export interface Question {
  id: string;
  exam_id: string;
  year: number;
  month: number;
  number: number;
  type: 'single_choice';
  category: Category;
  category_display: string;
  question: string;
  options: Record<string, string>;  // { A: '...', B: '...', C: '...', D: '...' }
  answer: string;                   // 'A' | 'B' | 'C' | 'D'
  explanation: string;
  difficulty: Difficulty;
  tags: string[];
  passage: string;                  // passage text for cloze questions
  // Reading comprehension grouping
  article_label?: string;           // 'A' | 'B' | 'C' | 'D'
  passage_group_id?: string;        // e.g. 'ZJ_2023_01_textA'
  passage_source?: string;          // e.g. '2023年1月 浙江卷 · Text A (Q21-Q24)'
}

export interface QuestionsData {
  questions: Question[];
  meta: {
    total: number;
    version: string;
    source: string;
    categories: Record<string, string>;
  };
}

// ─── Progress / storage types ────────────────────────────────────────────────

export interface QuestionAttempt {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  attemptedAt: number; // timestamp
}

export interface ExamSession {
  id: string;
  examId: string;
  startedAt: number;
  completedAt?: number;
  duration: number; // seconds allocated
  timeUsed: number; // seconds used
  answers: Record<string, string>; // questionId → chosen option
  score?: ExamScore;
}

export interface ExamScore {
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number; // 0-100
  wrongIds: string[];
}

export interface UserProgress {
  totalAttempted: number;
  totalCorrect: number;
  accuracy: number;
  wrongQuestionIds: string[];           // unique ids currently in wrong book
  attemptHistory: QuestionAttempt[];
  lastUpdated: number;
}

// ─── UI state types ──────────────────────────────────────────────────────────

export type AppView = 'home' | 'exam' | 'practice' | 'results' | 'wrongbook' | 'ai';

export interface ExamConfig {
  mode: 'exam' | 'practice';
  examId?: string;
  category?: Category;
  difficulty?: Difficulty;
  questionCount?: number;
  durationMinutes?: number;
  questionIds?: string[];
}
