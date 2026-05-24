import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { UserProgress, QuestionAttempt } from '../types';

const DEFAULT_PROGRESS: UserProgress = {
  totalAttempted: 0,
  totalCorrect: 0,
  accuracy: 0,
  wrongQuestionIds: [],
  attemptHistory: [],
  lastUpdated: Date.now(),
};

export function useProgress() {
  const [progress, setProgress] = useLocalStorage<UserProgress>(
    'gaokao_progress',
    DEFAULT_PROGRESS
  );

  const recordAttempt = useCallback(
    (attempt: QuestionAttempt) => {
      setProgress((prev) => {
        const history = [...prev.attemptHistory, attempt].slice(-500); // keep last 500
        const correct = history.filter((a) => a.isCorrect).length;
        const total = history.length;

        // Update wrong question list
        let wrongIds = [...prev.wrongQuestionIds];
        if (!attempt.isCorrect) {
          if (!wrongIds.includes(attempt.questionId)) {
            wrongIds.push(attempt.questionId);
          }
        } else {
          // Remove from wrong list if answered correctly
          wrongIds = wrongIds.filter((id) => id !== attempt.questionId);
        }

        return {
          totalAttempted: total,
          totalCorrect: correct,
          accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
          wrongQuestionIds: wrongIds,
          attemptHistory: history,
          lastUpdated: Date.now(),
        };
      });
    },
    [setProgress]
  );

  const recordBatch = useCallback(
    (attempts: QuestionAttempt[]) => {
      setProgress((prev) => {
        const history = [...prev.attemptHistory, ...attempts].slice(-500);
        const correct = history.filter((a) => a.isCorrect).length;
        const total = history.length;

        let wrongIds = [...prev.wrongQuestionIds];
        for (const attempt of attempts) {
          if (!attempt.isCorrect) {
            if (!wrongIds.includes(attempt.questionId)) {
              wrongIds.push(attempt.questionId);
            }
          } else {
            wrongIds = wrongIds.filter((id) => id !== attempt.questionId);
          }
        }

        return {
          totalAttempted: total,
          totalCorrect: correct,
          accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
          wrongQuestionIds: wrongIds,
          attemptHistory: history,
          lastUpdated: Date.now(),
        };
      });
    },
    [setProgress]
  );

  const removeFromWrongBook = useCallback(
    (questionId: string) => {
      setProgress((prev) => ({
        ...prev,
        wrongQuestionIds: prev.wrongQuestionIds.filter((id) => id !== questionId),
      }));
    },
    [setProgress]
  );

  const resetProgress = useCallback(() => {
    setProgress({ ...DEFAULT_PROGRESS, lastUpdated: Date.now() });
  }, [setProgress]);

  return { progress, recordAttempt, recordBatch, removeFromWrongBook, resetProgress };
}
