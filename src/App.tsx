import { useState, useEffect, useCallback } from 'react';
import type { Question, ExamConfig, ExamScore, AppView, QuestionsData } from './types';
import { useProgress } from './hooks/useProgress';
import { shuffleKeepingGroups, buildAttempts } from './utils/scoring';
import { Home } from './pages/Home';
import { ExamSelector } from './pages/ExamSelector';
import { PracticeSetup } from './pages/PracticeSetup';
import { QuizSession } from './pages/QuizSession';
import { Results } from './pages/Results';
import { WrongBook } from './pages/WrongBook';
import { AIAssistant } from './pages/AIAssistant';
import { ApiKeyModal } from './components/ApiKeyModal';

interface SessionState {
  questions: Question[];
  mode: 'exam' | 'practice';
  durationSeconds?: number;
  config: ExamConfig;
}

interface ResultState {
  answers: Record<string, string>;
  score: ExamScore;
  mode: 'exam' | 'practice';
  questions: Question[];
  config: ExamConfig;
}

export default function App() {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<AppView>('home');
  const [session, setSession] = useState<SessionState | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const { progress, recordBatch, removeFromWrongBook } = useProgress();

  useEffect(() => {
    // Use a relative path — more reliable in Capacitor iOS/Android than absolute '/'.
    // Retry up to 3 times with a short delay in case the WKWebView server isn't
    // ready yet (can happen on cold start after the renderer was killed by iOS).
    let cancelled = false;

    const load = (attempt: number) => {
      fetch('./questions.json', { cache: 'no-store' })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json() as Promise<QuestionsData>;
        })
        .then((data) => {
          if (cancelled) return;
          setAllQuestions(data.questions);
          setLoading(false);
        })
        .catch((e) => {
          if (cancelled) return;
          if (attempt < 3) {
            setTimeout(() => load(attempt + 1), 600 * attempt);
          } else {
            setError(String(e));
            setLoading(false);
          }
        });
    };

    load(1);
    return () => { cancelled = true; };
  }, []);

  const handleStartExam = useCallback(
    (config: ExamConfig) => {
      let pool = [...allQuestions];

      if (config.questionIds && config.questionIds.length > 0) {
        pool = pool.filter((q) => config.questionIds!.includes(q.id));
      }
      if (config.examId) {
        pool = pool.filter((q) => q.exam_id === config.examId);
      }
      if (config.category) {
        pool = pool.filter((q) => q.category === config.category);
      }
      if (config.difficulty) {
        pool = pool.filter((q) => q.difficulty === config.difficulty);
      }

      let selected: typeof pool;
      if (config.examId) {
        selected = pool.slice().sort((a, b) => a.number - b.number);
      } else if (config.questionIds && config.mode === 'exam') {
        const idOrder = new Map(config.questionIds.map((id, i) => [id, i]));
        selected = pool.slice().sort((a, b) => (idOrder.get(a.id) ?? 999) - (idOrder.get(b.id) ?? 999));
      } else {
        const shuffled = shuffleKeepingGroups(pool);
        const count = config.questionCount ?? Math.min(30, shuffled.length);
        selected = shuffled.slice(0, count);
      }

      if (selected.length === 0) {
        alert('暂无符合条件的题目，请调整筛选条件。');
        return;
      }

      setSession({
        questions: selected,
        mode: config.mode,
        durationSeconds: config.mode === 'exam' ? (config.durationMinutes ?? 45) * 60 : undefined,
        config,
      });
      setView('exam');
    },
    [allQuestions]
  );

  const handleSessionComplete = useCallback(
    (answers: Record<string, string>, score: ExamScore, attempts: ReturnType<typeof buildAttempts>) => {
      if (!session) return;
      recordBatch(attempts);
      setResult({ answers, score, mode: session.mode, questions: session.questions, config: session.config });
      setView('results');
    },
    [session, recordBatch]
  );

  const handleRetry = useCallback(() => {
    if (!result) return;
    handleStartExam(result.config);
  }, [result, handleStartExam]);

  const totalByCategory = allQuestions.reduce((acc, q) => {
    acc[q.category] = (acc[q.category] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const wrongQuestions = allQuestions.filter((q) => progress.wrongQuestionIds.includes(q.id));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">加载题库中…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-sm">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="font-semibold text-slate-800 mb-1">题库加载失败</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (view === 'home') {
    return (
      <>
        <Home
          progress={progress}
          onStartExam={(config) => {
            if (config.mode === 'practice' && !config.questionIds) {
              setView('practice');
            } else if (config.mode === 'exam') {
              setView('exam_select');
            } else {
              handleStartExam(config);
            }
          }}
          onViewWrongBook={() => setView('wrongbook')}
          onViewAI={() => setView('ai')}
          onSettings={() => setShowApiKeyModal(true)}
        />
        {showApiKeyModal && (
          <ApiKeyModal
            onClose={() => setShowApiKeyModal(false)}
            onSaved={() => setShowApiKeyModal(false)}
          />
        )}
      </>
    );
  }

  if (view === 'exam_select') {
    return (
      <ExamSelector
        allQuestions={allQuestions}
        onStart={(config) => handleStartExam(config)}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'practice') {
    return (
      <PracticeSetup
        totalByCategory={totalByCategory}
        onStart={handleStartExam}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'exam' && session) {
    return (
      <QuizSession
        questions={session.questions}
        mode={session.mode}
        durationSeconds={session.durationSeconds}
        onComplete={handleSessionComplete}
        onExit={() => setView('home')}
      />
    );
  }

  if (view === 'results' && result) {
    return (
      <Results
        questions={result.questions}
        answers={result.answers}
        score={result.score}
        mode={result.mode}
        onHome={() => setView('home')}
        onRetry={handleRetry}
        onViewWrongBook={() => setView('wrongbook')}
      />
    );
  }

  if (view === 'wrongbook') {
    return (
      <WrongBook
        wrongQuestions={wrongQuestions}
        onPracticeWrong={() => handleStartExam({ mode: 'practice', questionIds: progress.wrongQuestionIds })}
        onRemove={removeFromWrongBook}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'ai') {
    return <AIAssistant onBack={() => setView('home')} />;
  }

  return null;
}
