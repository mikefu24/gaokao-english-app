import React, { useState } from 'react';
import { ArrowLeft, Trash2, Play, BookOpen, CheckCircle } from 'lucide-react';
import type { Question } from '../types';
import { DIFFICULTY_COLOR, DIFFICULTY_LABEL } from '../utils/scoring';

interface WrongBookProps {
  wrongQuestions: Question[];
  onPracticeWrong: () => void;
  onRemove: (id: string) => void;
  onBack: () => void;
}

export const WrongBook: React.FC<WrongBookProps> = ({
  wrongQuestions,
  onPracticeWrong,
  onRemove,
  onBack,
}) => {
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  if (wrongQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center px-4">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">错题本是空的</h2>
          <p className="text-slate-500 text-sm mb-6">你还没有错题，继续保持！</p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">错题本</h2>
            <p className="text-slate-500 text-sm mt-0.5">共 {wrongQuestions.length} 道错题</p>
          </div>
          <button
            onClick={onPracticeWrong}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition-all"
          >
            <Play className="w-4 h-4" />
            重新练习
          </button>
        </div>

        {/* Questions */}
        <div className="space-y-3">
          {wrongQuestions.map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                      {q.category_display}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${DIFFICULTY_COLOR[q.difficulty]}`}>
                      {DIFFICULTY_LABEL[q.difficulty]}
                    </span>
                    <span className="text-xs text-slate-400">{q.year}年</span>
                  </div>
                  <p className="text-sm text-slate-700 font-medium line-clamp-2">{q.question}</p>

                  {/* Options preview */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {Object.entries(q.options).map(([letter, text]) => (
                      <div
                        key={letter}
                        className={`text-xs px-2 py-1 rounded-lg flex items-start gap-1.5 ${
                          letter === q.answer
                            ? 'bg-emerald-50 text-emerald-700 font-medium'
                            : 'bg-slate-50 text-slate-500'
                        }`}
                      >
                        <span className="font-semibold">{letter}.</span>
                        <span className="line-clamp-1">{text}</span>
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <p className="mt-2 text-xs text-slate-400 line-clamp-1 italic">{q.explanation}</p>
                  )}
                </div>

                <button
                  onClick={() => setConfirmRemove(q.id)}
                  className="flex-shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm remove modal */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full animate-slide-up">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-center mb-1">从错题本中移除？</h3>
            <p className="text-slate-500 text-sm text-center mb-6">该题将从错题本中删除</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRemove(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onRemove(confirmRemove);
                  setConfirmRemove(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700"
              >
                移除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
