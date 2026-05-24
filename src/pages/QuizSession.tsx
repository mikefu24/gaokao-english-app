import React, { useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, CheckSquare, X } from 'lucide-react';
import type { Question, ExamScore } from '../types';
import { QuestionCard } from '../components/QuestionCard';
import { WritingCard } from '../components/WritingCard';
import { AIPanel } from '../components/AIPanel';
import { AIWritingPanel } from '../components/AIWritingPanel';
import { ApiKeyModal } from '../components/ApiKeyModal';
import { PassageGroupHeader } from '../components/PassageGroupHeader';
import { Timer } from '../components/Timer';
import { ProgressBar } from '../components/ProgressBar';
import { scoreExam, buildAttempts, isWritingQuestion } from '../utils/scoring';

interface QuizSessionProps {
  questions: Question[];
  mode: 'exam' | 'practice';
  durationSeconds?: number; // exam mode only
  onComplete: (
    answers: Record<string, string>,
    score: ExamScore,
    attempts: ReturnType<typeof buildAttempts>
  ) => void;
  onExit: () => void;
}

export const QuizSession: React.FC<QuizSessionProps> = ({
  questions,
  mode,
  durationSeconds,
  onComplete,
  onExit: _onExit,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  // writing-specific: track which writing questions are "submitted" in practice
  const [writingSubmitted, setWritingSubmitted] = useState<Record<string, boolean>>({});
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showWritingPanel, setShowWritingPanel] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const current = questions[currentIdx];
  const isCurrentWriting = isWritingQuestion(current);
  const prev = currentIdx > 0 ? questions[currentIdx - 1] : null;
  const isRevealed = mode === 'practice' && !!revealed[current.id];
  const selectedAnswer = answers[current.id] ?? null;
  const currentWritingText = answers[current.id] ?? '';
  const isWritingDone = writingSubmitted[current.id] ?? false;

  // Show passage group header when entering a new article group
  const isNewGroup =
    current.passage_group_id != null &&
    current.passage_group_id !== prev?.passage_group_id;

  // Count questions in current passage group
  const groupCount = current.passage_group_id
    ? questions.filter((q) => q.passage_group_id === current.passage_group_id).length
    : 0;

  const handleSelectAnswer = useCallback(
    (letter: string) => {
      if (mode === 'practice' && revealed[current.id]) return;
      setAnswers((prev) => ({ ...prev, [current.id]: letter }));
      if (mode === 'practice') {
        // auto-reveal in practice mode
        setTimeout(() => {
          setRevealed((prev) => ({ ...prev, [current.id]: true }));
        }, 300);
      }
    },
    [current.id, mode, revealed]
  );

  const handleWritingChange = useCallback(
    (text: string) => {
      if (mode === 'practice' && writingSubmitted[current.id]) return;
      setAnswers((prev) => ({ ...prev, [current.id]: text }));
    },
    [current.id, mode, writingSubmitted]
  );

  const handleWritingSubmit = useCallback(() => {
    setWritingSubmitted((prev) => ({ ...prev, [current.id]: true }));
  }, [current.id]);

  const goNext = () => {
    if (currentIdx < questions.length - 1) setCurrentIdx((i) => i + 1);
  };

  const goPrev = () => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
  };

  const handleSubmit = useCallback(() => {
    const score = scoreExam(questions, answers);
    const attempts = buildAttempts(questions, answers);
    onComplete(answers, score, attempts);
  }, [questions, answers, onComplete]);

  const handleTimeUp = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  // Count answered: MCQ has selected option; writing has non-empty text
  const answeredCount = Object.entries(answers).filter(([, v]) => v !== '').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-2xl mx-auto px-4 pb-32">

        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-200 py-3 mb-6">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">退出</span>
            </button>

            <div className="flex-1 max-w-xs">
              <ProgressBar
                current={currentIdx + 1}
                total={questions.length}
                answered={answeredCount}
              />
            </div>

            {mode === 'exam' && durationSeconds ? (
              <Timer durationSeconds={durationSeconds} onTimeUp={handleTimeUp} />
            ) : (
              <span className="text-xs text-slate-400">
                {mode === 'practice' ? '练习模式' : '考试模式'}
              </span>
            )}
          </div>
        </div>

        {/* Question */}
        {/* Passage group header — shown at the start of each new reading article */}
        {!isCurrentWriting && isNewGroup && current.passage_source && (
          <PassageGroupHeader
            passageSource={current.passage_source}
            articleLabel={current.article_label}
            category={current.category}
            questionCount={groupCount}
            passage={current.passage ?? ''}
          />
        )}

        {isCurrentWriting ? (
          <WritingCard
            question={current}
            questionIndex={currentIdx}
            totalQuestions={questions.length}
            userText={currentWritingText}
            onChangeText={handleWritingChange}
            submitted={mode === 'practice' ? isWritingDone : false}
            onSubmitDraft={mode === 'practice' ? handleWritingSubmit : () => {}}
            onAIScore={
              (mode === 'practice' && isWritingDone) || mode === 'exam'
                ? () => setShowWritingPanel(true)
                : undefined
            }
          />
        ) : (
          <QuestionCard
            question={current}
            questionIndex={currentIdx}
            totalQuestions={questions.length}
            selectedAnswer={selectedAnswer}
            revealed={isRevealed}
            onSelectAnswer={handleSelectAnswer}
            onAIExplain={isRevealed ? () => setShowAIPanel(true) : undefined}
          />
        )}

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-10">
          <div className="max-w-2xl mx-auto px-4 pb-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-3 flex items-center gap-3">
              <button
                onClick={goPrev}
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
                      className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${
                        active
                          ? 'w-4 bg-blue-600'
                          : done
                          ? 'bg-blue-300'
                          : 'bg-slate-200'
                      }`}
                    />
                  );
                })}
              </div>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={goNext}
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

        {/* AI writing panel */}
        {showWritingPanel && isCurrentWriting && (
          <AIWritingPanel
            question={current}
            userText={currentWritingText}
            onClose={() => setShowWritingPanel(false)}
            onNeedKey={() => {
              setShowWritingPanel(false);
              setShowApiKeyModal(true);
            }}
          />
        )}

        {/* AI explanation panel */}
        {showAIPanel && (
          <AIPanel
            question={current}
            userAnswer={selectedAnswer}
            onClose={() => setShowAIPanel(false)}
            onNeedKey={() => {
              setShowAIPanel(false);
              setShowApiKeyModal(true);
            }}
          />
        )}

        {/* API key modal */}
        {showApiKeyModal && (
          <ApiKeyModal
            onClose={() => setShowApiKeyModal(false)}
            onSaved={() => {
              setShowApiKeyModal(false);
              setShowAIPanel(true);
            }}
          />
        )}

        {/* Submit confirm modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full animate-slide-up">
              <h3 className="font-bold text-slate-900 text-lg mb-1">
                {answeredCount < questions.length ? '还有未作答的题目' : '确认提交？'}
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                已作答 <span className="font-semibold text-slate-700">{answeredCount}</span> /{' '}
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
