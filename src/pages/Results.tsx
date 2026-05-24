import React, { useState } from 'react';
import { Home, RotateCcw, BookMarked, CheckCircle, XCircle, MinusCircle, PenLine, Bot, Loader2, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import type { Question, ExamScore } from '../types';
import { isWritingQuestion } from '../utils/scoring';
import { scoreEssay, scoreContinuation, hasApiKey } from '../services/ai';
import { ApiKeyModal } from '../components/ApiKeyModal';

interface ResultsProps {
  questions: Question[];
  answers: Record<string, string>;
  score: ExamScore;
  mode: 'exam' | 'practice';
  onHome: () => void;
  onRetry: () => void;
  onViewWrongBook: () => void;
}

export const Results: React.FC<ResultsProps> = ({
  questions,
  answers,
  score,
  mode,
  onHome,
  onRetry,
  onViewWrongBook,
}) => {
  const grade = getGrade(score.accuracy);
  const writingQuestions = questions.filter(isWritingQuestion);

  // Per-writing-question AI feedback state
  const [aiFeedback, setAiFeedback] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiError, setAiError] = useState<Record<string, string>>({});
  const [aiDone, setAiDone] = useState<Record<string, boolean>>({});
  const [showSample, setShowSample] = useState<Record<string, boolean>>({});
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const handleScoreWriting = (q: Question) => {
    if (!hasApiKey()) { setShowApiKeyModal(true); return; }
    const text = answers[q.id] ?? '';
    if (!text.trim()) return;

    setAiLoading((prev) => ({ ...prev, [q.id]: true }));
    setAiFeedback((prev) => ({ ...prev, [q.id]: '' }));
    setAiError((prev) => ({ ...prev, [q.id]: '' }));
    setAiDone((prev) => ({ ...prev, [q.id]: false }));

    const onChunk = (chunk: string) =>
      setAiFeedback((prev) => ({ ...prev, [q.id]: (prev[q.id] ?? '') + chunk }));

    const promise =
      q.category === 'continuation'
        ? scoreContinuation(text, q.passage ?? '', q.question, onChunk)
        : scoreEssay(text, q.question, onChunk);

    promise
      .then(() => {
        setAiLoading((prev) => ({ ...prev, [q.id]: false }));
        setAiDone((prev) => ({ ...prev, [q.id]: true }));
      })
      .catch((e: unknown) => {
        setAiLoading((prev) => ({ ...prev, [q.id]: false }));
        setAiError((prev) => ({
          ...prev,
          [q.id]: e instanceof Error ? e.message : String(e),
        }));
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* ── Score hero (MCQ) ──────────────────────────────────────── */}
        {score.total > 0 && (
          <>
            <div className="text-center mb-10">
              <div
                className={`inline-flex items-center justify-center w-28 h-28 rounded-full text-4xl font-bold mb-4 ${grade.bg} ${grade.text}`}
              >
                {score.accuracy}%
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{grade.label}</h2>
              <p className="text-slate-500 text-sm mt-1">
                {mode === 'exam' ? '模拟考试' : '专项训练'} · 客观题 {score.total} 题
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <ResultStat icon={<CheckCircle className="w-5 h-5 text-emerald-500" />} label="答对" value={score.correct} color="text-emerald-600" />
              <ResultStat icon={<XCircle className="w-5 h-5 text-rose-500" />} label="答错" value={score.wrong} color="text-rose-600" />
              <ResultStat icon={<MinusCircle className="w-5 h-5 text-slate-400" />} label="未答" value={score.skipped} color="text-slate-500" />
            </div>
          </>
        )}

        {/* Writing-only header when there are no MCQ questions */}
        {score.total === 0 && writingQuestions.length > 0 && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-violet-100 mb-4">
              <PenLine className="w-8 h-8 text-violet-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">写作完成</h2>
            <p className="text-slate-500 text-sm mt-1">
              共 {writingQuestions.length} 道写作题，请获取 AI 批改
            </p>
          </div>
        )}

        {/* ── Wrong MCQ list ────────────────────────────────────────── */}
        {score.wrongIds.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">错题列表</p>
            <div className="space-y-2">
              {score.wrongIds.map((id) => {
                const q = questions.find((x) => x.id === id);
                if (!q) return null;
                const userAns = answers[id];
                return (
                  <div key={id} className="bg-white rounded-2xl border border-rose-100 p-4">
                    <p className="text-sm text-slate-700 font-medium mb-2 line-clamp-2">{q.question}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md">
                        你选了：{userAns ?? '未作答'} — {userAns ? q.options[userAns] : '—'}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                        正确：{q.answer} — {q.options[q.answer]}
                      </span>
                    </div>
                    {q.explanation && (
                      <p className="mt-2 text-xs text-slate-500 line-clamp-2">{q.explanation}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Writing / Continuation section ───────────────────────── */}
        {writingQuestions.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              写作题 AI 批改
            </p>
            <div className="space-y-4">
              {writingQuestions.map((q) => {
                const text = answers[q.id] ?? '';
                const feedback = aiFeedback[q.id] ?? '';
                const loading = aiLoading[q.id] ?? false;
                const error = aiError[q.id] ?? '';
                const done = aiDone[q.id] ?? false;
                const sampleVisible = showSample[q.id] ?? false;
                const isContinuation = q.category === 'continuation';

                return (
                  <div key={q.id} className="bg-white rounded-2xl border border-violet-100 overflow-hidden">
                    {/* Writing question header */}
                    <div className="px-5 py-3 bg-violet-50 border-b border-violet-100 flex items-center gap-2">
                      <PenLine className="w-4 h-4 text-violet-500" />
                      <span className="text-sm font-semibold text-violet-700">{q.category_display}</span>
                      <span className="text-xs text-violet-400 ml-auto">满分 {q.max_score ?? (isContinuation ? 25 : 15)} 分</span>
                    </div>

                    <div className="p-5">
                      {/* Prompt preview */}
                      <p className="text-xs text-slate-500 mb-3 line-clamp-3">{q.question}</p>

                      {/* Student text */}
                      {text ? (
                        <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <p className="text-xs text-slate-400 font-medium mb-1">你的作文</p>
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{text}</p>
                        </div>
                      ) : (
                        <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                          <p className="text-xs text-amber-600">未作答此题</p>
                        </div>
                      )}

                      {/* AI feedback */}
                      {loading && !feedback && (
                        <div className="flex items-center gap-2 text-violet-600 text-sm">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          AI 正在批改中…
                        </div>
                      )}

                      {error && (
                        <div className="flex items-start gap-2 text-rose-600 bg-rose-50 rounded-xl p-3 text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          {error}
                        </div>
                      )}

                      {feedback && (
                        <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed mb-3">
                          <WritingFeedback text={feedback} />
                          {loading && (
                            <span className="inline-block w-0.5 h-4 bg-violet-500 animate-pulse ml-0.5 align-middle" />
                          )}
                        </div>
                      )}

                      {done && (
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                          <Sparkles className="w-3 h-3" />
                          批改完成
                        </div>
                      )}

                      {/* Sample answer toggle */}
                      {done && q.sample_answer && (
                        <div className="mb-3">
                          <button
                            onClick={() => setShowSample((p) => ({ ...p, [q.id]: !sampleVisible }))}
                            className="flex items-center gap-1.5 text-xs text-violet-600 font-medium hover:text-violet-800"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            {sampleVisible ? '收起参考范文' : '查看参考范文'}
                          </button>
                          {sampleVisible && (
                            <div className="mt-2 p-4 bg-violet-50 border border-violet-200 rounded-xl">
                              <p className="text-xs font-semibold text-violet-600 mb-2">参考范文</p>
                              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {q.sample_answer}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Score button */}
                      {!loading && !feedback && text && (
                        <button
                          onClick={() => handleScoreWriting(q)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-violet-200 bg-violet-50 text-violet-700 text-sm font-medium hover:bg-violet-100 transition-colors"
                        >
                          <Bot className="w-4 h-4" />
                          获取 AI 批改
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Actions ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <ActionBtn icon={<Home className="w-4 h-4" />} label="首页" onClick={onHome} variant="ghost" />
          <ActionBtn icon={<RotateCcw className="w-4 h-4" />} label="再练一次" onClick={onRetry} variant="ghost" />
          {score.wrongIds.length > 0 && (
            <ActionBtn icon={<BookMarked className="w-4 h-4" />} label="错题本" onClick={onViewWrongBook} variant="primary" />
          )}
        </div>

      </div>

      {/* API Key modal (triggered if key missing when scoring) */}
      {showApiKeyModal && (
        <ApiKeyModal onClose={() => setShowApiKeyModal(false)} onSaved={() => setShowApiKeyModal(false)} />
      )}
    </div>
  );
};

// ── helpers ───────────────────────────────────────────────────────────────────

function getGrade(accuracy: number) {
  if (accuracy >= 90) return { label: '优秀！', bg: 'bg-emerald-100', text: 'text-emerald-700' };
  if (accuracy >= 75) return { label: '良好', bg: 'bg-blue-100', text: 'text-blue-700' };
  if (accuracy >= 60) return { label: '及格', bg: 'bg-amber-100', text: 'text-amber-700' };
  return { label: '需要加油', bg: 'bg-rose-100', text: 'text-rose-700' };
}

const ResultStat: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({
  icon, label, value, color,
}) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
    <div className="flex justify-center mb-1">{icon}</div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
  </div>
);

const ActionBtn: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; variant: 'ghost' | 'primary' }> = ({
  icon, label, onClick, variant,
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl text-sm font-medium transition-all ${
      variant === 'primary'
        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
        : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50'
    }`}
  >
    {icon}
    {label}
  </button>
);

// Inline markdown-lite renderer for AI writing feedback
function WritingFeedback({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        if (line.startsWith('## '))
          return <h3 key={i} className="font-semibold text-slate-900 mt-4 mb-1 text-sm">{line.slice(3)}</h3>;
        if (line.startsWith('### '))
          return <h4 key={i} className="font-medium text-slate-800 mt-3 mb-1 text-sm">{line.slice(4)}</h4>;
        if (line.startsWith('- ') || line.startsWith('• '))
          return (
            <div key={i} className="flex items-start gap-2 my-1">
              <span className="text-violet-400 mt-1 flex-shrink-0">•</span>
              <span className="text-sm">{line.slice(2)}</span>
            </div>
          );
        if (line.trim() === '') return <div key={i} className="h-2" />;
        return <p key={i} className="text-sm my-1">{line}</p>;
      })}
    </>
  );
}
