import React from 'react';
import { Home, RotateCcw, BookMarked, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import type { Question, ExamScore } from '../types';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Score hero */}
        <div className="text-center mb-10">
          <div
            className={`inline-flex items-center justify-center w-28 h-28 rounded-full text-4xl font-bold mb-4 ${grade.bg} ${grade.text}`}
          >
            {score.accuracy}%
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{grade.label}</h2>
          <p className="text-slate-500 text-sm mt-1">
            {mode === 'exam' ? '模拟考试' : '专项训练'} · 共 {score.total} 题
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <ResultStat
            icon={<CheckCircle className="w-5 h-5 text-emerald-500" />}
            label="答对"
            value={score.correct}
            color="text-emerald-600"
          />
          <ResultStat
            icon={<XCircle className="w-5 h-5 text-rose-500" />}
            label="答错"
            value={score.wrong}
            color="text-rose-600"
          />
          <ResultStat
            icon={<MinusCircle className="w-5 h-5 text-slate-400" />}
            label="未答"
            value={score.skipped}
            color="text-slate-500"
          />
        </div>

        {/* Wrong questions list */}
        {score.wrongIds.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              错题列表
            </p>
            <div className="space-y-2">
              {score.wrongIds.map((id) => {
                const q = questions.find((x) => x.id === id);
                if (!q) return null;
                const userAns = answers[id];
                return (
                  <div
                    key={id}
                    className="bg-white rounded-2xl border border-rose-100 p-4"
                  >
                    <p className="text-sm text-slate-700 font-medium mb-2 line-clamp-2">
                      {q.question}
                    </p>
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

        {/* Actions */}
        <div className="grid grid-cols-3 gap-3">
          <ActionBtn
            icon={<Home className="w-4 h-4" />}
            label="首页"
            onClick={onHome}
            variant="ghost"
          />
          <ActionBtn
            icon={<RotateCcw className="w-4 h-4" />}
            label="再练一次"
            onClick={onRetry}
            variant="ghost"
          />
          {score.wrongIds.length > 0 && (
            <ActionBtn
              icon={<BookMarked className="w-4 h-4" />}
              label="错题本"
              onClick={onViewWrongBook}
              variant="primary"
            />
          )}
        </div>
      </div>
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

const ResultStat: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}> = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
    <div className="flex justify-center mb-1">{icon}</div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
  </div>
);

const ActionBtn: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant: 'ghost' | 'primary';
}> = ({ icon, label, onClick, variant }) => (
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
