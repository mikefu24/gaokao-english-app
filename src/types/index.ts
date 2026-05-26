// ─── Core data types ────────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Category = 'reading' | 'cloze' | 'gapfill' | 'grammar' | 'seven_choice' | 'writing' | 'continuation' | 'listening';
export type Level = 'gaokao' | 'grade10' | 'grade11';

export interface Question {
  id: string;
  exam_id: string;
  year: number;
  month: number;
  number: number;
  type: 'single_choice' | 'open_ended';
  category: Category;
  category_display: string;
  level?: Level;            // 'gaokao' | 'grade10' | 'grade11' (absent = gaokao)
  question: string;
  options: Record<string, string>;  // { A: '...', B: '...', C: '...', D: '...' } — empty for open_ended
  answer: string;                   // 'A'|'B'|'C'|'D' for MCQ; '' for open_ended
  explanation: string;
  difficulty: Difficulty;
  tags: string[];
  passage: string;                  // passage text for cloze/continuation
  // Reading comprehension grouping
  article_label?: string;           // 'A' | 'B' | 'C' | 'D'
  passage_group_id?: string;        // e.g. 'ZJ_2023_01_textA'
  passage_source?: string;          // e.g. '2023年1月 浙江卷 · Text A (Q21-Q24)'
  // Writing / continuation
  word_count_min?: number;          // min required words
  word_count_max?: number;          // max allowed words
  max_score?: number;               // 15 for writing, 25 for continuation
  sample_answer?: string;           // reference answer (shown after AI scoring)
  para1_start?: string;             // continuation paragraph 1 opening line
  para2_start?: string;             // continuation paragraph 2 opening line
  // Listening
  audio_file?: string;              // filename under /audio/, e.g. 'listen_zj_2026.mp3'
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
  total: number;      // MCQ questions only
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;   // 0-100
  wrongIds: string[];
  writingCount: number; // number of open-ended questions
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

export type AppView = 'home' | 'exam_select' | 'exam' | 'practice' | 'results' | 'wrongbook' | 'ai';

export interface ExamConfig {
  mode: 'exam' | 'practice';
  examId?: string;
  category?: Category;
  difficulty?: Difficulty;
  level?: Level;           // filter by level: 'gaokao' | 'grade10' | 'grade11'
  questionCount?: number;
  durationMinutes?: number;
  questionIds?: string[];
}
