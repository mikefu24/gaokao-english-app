import type { Question, ExamScore, QuestionAttempt } from '../types';

/** True for open-ended writing / continuation questions */
export function isWritingQuestion(q: Question): boolean {
  return q.type === 'open_ended' || q.category === 'writing' || q.category === 'continuation';
}

/**
 * Score a completed exam session.
 * Writing questions are excluded from MCQ stats (tracked separately via writingCount).
 * answers: { [questionId]: selectedOption | text }
 */
export function scoreExam(
  questions: Question[],
  answers: Record<string, string>
): ExamScore {
  const mcqQuestions = questions.filter((q) => !isWritingQuestion(q));
  const writingCount = questions.length - mcqQuestions.length;

  let correct = 0;
  const wrongIds: string[] = [];

  for (const q of mcqQuestions) {
    const userAnswer = answers[q.id];
    if (!userAnswer) continue; // skipped
    if (userAnswer === q.answer) {
      correct++;
    } else {
      wrongIds.push(q.id);
    }
  }

  const answered = Object.keys(answers).filter(
    (id) => !isWritingQuestion(questions.find((q) => q.id === id)!)
  ).length;
  const skipped = mcqQuestions.length - answered;

  return {
    total: mcqQuestions.length,
    correct,
    wrong: wrongIds.length,
    skipped,
    accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
    wrongIds,
    writingCount,
  };
}

/**
 * Convert exam answers → attempt history entries.
 * Writing questions are excluded (no correct/incorrect concept).
 */
export function buildAttempts(
  questions: Question[],
  answers: Record<string, string>
): QuestionAttempt[] {
  const now = Date.now();
  return questions
    .filter((q) => !isWritingQuestion(q) && answers[q.id])
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

/**
 * Shuffle reading questions while keeping same-article groups together.
 * Within each group, preserve original question order (by number).
 * Groups themselves are shuffled randomly.
 */
export function shuffleKeepingGroups(questions: import('../types').Question[]): import('../types').Question[] {
  // Separate into grouped (reading) and ungrouped
  const grouped = new Map<string, import('../types').Question[]>();
  const ungrouped: import('../types').Question[] = [];

  for (const q of questions) {
    if (q.passage_group_id) {
      const group = grouped.get(q.passage_group_id) ?? [];
      group.push(q);
      grouped.set(q.passage_group_id, group);
    } else {
      ungrouped.push(q);
    }
  }

  // Sort within each group by question number
  for (const [, group] of grouped) {
    group.sort((a, b) => a.number - b.number);
  }

  // Shuffle the groups themselves
  const groupKeys = shuffle([...grouped.keys()]);
  const groupedQuestions = groupKeys.flatMap((key) => grouped.get(key)!);

  // Shuffle ungrouped, then interleave at end
  return [...groupedQuestions, ...shuffle(ungrouped)];
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
