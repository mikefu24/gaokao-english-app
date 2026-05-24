/**
 * ListeningSession — dedicated page for listening practice/exam.
 * Shows an AudioPlayer pinned at the top, with questions scrollable below.
 * Supports both "exam" (submit at end) and "practice" (auto-reveal) modes.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  ArrowLeft, ArrowRight, CheckSquare, X, Headphones, ChevronDown, ChevronUp,
} from 'lucide-react';
import type { Question, ExamScore } from '../types';
import { AudioPlayer } from '../components/AudioPlayer';
import { scoreExam, buildAttempts } from '../utils/scoring';

interface ListeningSessionProps {
  questions: Question[];
  mode: 'exam' | 'practice';
  onComplete: (
    answers: Record<string, string>,
    score: ExamScore,
    attempts: ReturnType<typeof buildAttempts>
  ) => void;
  onExit: () => void;
}

export const ListeningSession: React.FC<ListeningSessionProps> = ({
  questions,
  mode,
  onComplete,
  onExit: _onExit,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [playerCollapsed, setPlayerCollapsed] = useState(false);

  // Group questions by audio file
  const audioFile = questions[0]?.audio_file ?? '';
  const audioSrc = audioFile ? `/audio/${audioFile}` : '';

  // Build exam title from questions
  const { year, month, exam_id } = useMemo(() => {
    const q = questions[0];
    return { year: q?.year ?? 0, month: q?.month ?? 0, exam_id: q?.exam_id ?? '' };
  }, [questions]);

  const audioTitle = useMemo(() => {
    const region = exam_id.startsWith('ZJ') ? '浙江卷' : '新课标Ⅰ卷';
    const monthLabel = month === 1 ? '1月' : month === 6 ? '6月' : `${month}月`;
    return `${year}年${monthLabel} ${region}`;
  }, [year, month, exam_id]);

  const current = questions[currentIdx];
  const isRevealed = mode === 'practice' && !!revealed[current?.id];
  const selectedAnswer = answers[current?.id] ?? null;
  const answeredCount = Object.values(answers).filter(Boolean).length;

  const handleSelect = useCallback(
    (letter: string) => {
      if (!current) return;
      if (mode === 'practice' && revealed[current.id]) return;
      setAnswers((prev) => ({ ...prev, [current.id]: letter }));
      if (mode === 'practice') {
        setTimeout(() => setRevealed((prev) => ({ ...prev, [current.id]: true })), 300);
      }
    },
    [current, mode, revealed]
  );

  const handleSubmit = useCallback(() => {
    const score = scoreExam(questions, answers);
    const attempts = buildAttempts(questions, answers);
    onComplete(answers, score, attempts);
  }, [questions, answers, onComplete]);

  if (!current) return null;

  const opts = current.options ?? {};
  const optLetters = Object.keys(opts).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-2xl mx-auto px-4 pb-32">

        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-200 py-3 mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">退出</span>
            </button>
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-2">
                <Headphones className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-slate-700">{audioTitle}</span>
              </div>
              <p className="text-xs text-slate-400">
                已答 {answeredCount}/{questions.length} 题 · {mode === 'practice' ? '练习' : '考试'}模式
              </p>
            </div>
            <div className="w-10" />
          </div>
        </div>

        {/* ── Audio Player ─────────────────────────────────────────────── */}
        <div className="mb-4">
          {!playerCollapsed ? (
            <div className="relative">
              <AudioPlayer src={audioSrc} title={audioTitle} />
              <button
                onClick={() => setPlayerCollapsed(true)}
                className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                title="收起播放器"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setPlayerCollapsed(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              <Headphones className="w-4 h-4" />
              展开播放器
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Question Card ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">
          {/* Question header */}
          <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-blue-50/0 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full">
                第{current.number}题
              </span>
              <span className="text-xs text-slate-400">
                {current.listening_section === 1 ? '第一节' : '第二节'}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {currentIdx + 1} / {questions.length}
            </span>
          </div>

          <div className="p-5">
            <p className="text-base text-slate-800 font-medium mb-5 leading-relaxed">
              {current.question}
            </p>

            {/* Options */}
            <div className="space-y-2.5">
              {optLetters.map((letter) => {
                const text = opts[letter];
                const isSelected = selectedAnswer === letter;
                const isCorrect = current.answer === letter;
                const showResult = isRevealed;

                let cls = 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50';
                if (isSelected && !showResult)
                  cls = 'border-blue-500 bg-blue-50 text-blue-800';
                if (showResult && isCorrect)
                  cls = 'border-emerald-400 bg-emerald-50 text-emerald-800';
                if (showResult && isSelected && !isCorrect)
                  cls = 'border-rose-400 bg-rose-50 text-rose-800';

                return (
                  <button
                    key={letter}
                    onClick={() => handleSelect(letter)}
                    className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-sm text-left transition-all ${cls}`}
                    disabled={mode === 'practice' && !!revealed[current.id]}
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs mt-0.5"
                      style={{ borderColor: 'currentColor' }}>
                      {letter}
                    </span>
                    <span className="leading-relaxed">{text}</span>
                  </button>
                );
              })}
            </div>

            {/* Practice mode explanation */}
            {isRevealed && current.explanation && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-semibold text-amber-700 mb-1">解析</p>
                <p className="text-xs text-amber-800 leading-relaxed">{current.explanation}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom navigation ────────────────────────────────────────── */}
        <div className="fixed bottom-0 left-0 right-0 z-10">
          <div className="max-w-2xl mx-auto px-4 pb-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-3 flex items-center gap-3">
              <button
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" /> 上一题
              </button>

              {/* Dot navigator */}
              <div className="flex-1 flex items-center justify-center gap-1 overflow-x-auto">
                {questions.map((q, i) => {
                  const done = !!answers[q.id];
                  const active = i === currentIdx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(i)}
                      className={`flex-shrink-0 rounded-full transition-all ${
                        active ? 'w-4 h-2 bg-blue-600' : done ? 'w-2 h-2 bg-blue-300' : 'w-2 h-2 bg-slate-200'
                      }`}
                    />
                  );
                })}
              </div>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx((i) => i + 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  下一题 <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <CheckSquare className="w-4 h-4" /> 提交
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Submit confirm modal ─────────────────────────────────────── */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full animate-slide-up">
              <h3 className="font-bold text-slate-900 text-lg mb-1">
                {answeredCount < questions.length ? '还有未作答的题目' : '确认提交？'}
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                已作答{' '}
                <span className="font-semibold text-slate-700">{answeredCount}</span> /{' '}
                {questions.length} 题
                {answeredCount < questions.length && (
                  <span className="text-amber-600">
                    ，未作答 {questions.length - answeredCount} 题将计为错误
                  </span>
                )}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  继续作答
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                >
                  确认提交
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
