import type { Question, ExamScore, QuestionAttempt } from '../types';

/**
 * Score a completed exam session.
 * answers: { [questionId]: selectedOption }
 */
export function scoreExam(
  questions: Question[],
  answers: Record<string, string>
): ExamScore {
  let correct = 0;
  const wrongIds: string[] = [];

  for (const q of questions) {
    const userAnswer = answers[q.id];
    if (!userAnswer) continue; // skipped
    if (userAnswer === q.answer) {
      correct++;
    } else {
      wrongIds.push(q.id);
    }
  }

  const answered = Object.keys(answers).length;
  const skipped = questions.length - answered;

  return {
    total: questions.length,
    correct,
    wrong: wrongIds.length,
    skipped,
    accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
    wrongIds,
  };
}

/**
 * Convert exam answers → attempt history entries.
 */
export function buildAttempts(
  questions: Question[],
  answers: Record<string, string>
): QuestionAttempt[] {
  const now = Date.now();
  return questions
    .filter((q) => answers[q.id])
    .map((q) => ({
      questionId: q.id,
      userAnswer: answers[q.id],
      isCorrect: answers[q.id] === q.answer,
      attemptedAt: now,
    }));
}

/**
 * Shuffle an array (Fisher-Yates).
 */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Format seconds as mm:ss */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Difficulty label */
export const DIFFICULTY_LABEL: Record<string, string> = {
  easy: '基础',
  medium: '中等',
  hard: '进阶',
};

export const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'text-emerald-600 bg-emerald-50',
  medium: 'text-amber-600 bg-amber-50',
  hard: 'text-rose-600 bg-rose-50',
};
