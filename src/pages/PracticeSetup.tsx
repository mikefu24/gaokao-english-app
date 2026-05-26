import React, { useState } from 'react';
import { ArrowLeft, BookOpen, FileText, AlignLeft, Headphones } from 'lucide-react';
import type { Category, ExamConfig } from '../types';

interface PracticeSetupProps {
  totalByCategory: Record<string, number>;
  onStart: (config: ExamConfig) => void;
  onBack: () => void;
}

const CATEGORIES: { id: Category; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: 'reading',
    label: '阅读理解',
    desc: '阅读文章，理解细节与主旨',
    icon: <BookOpen className="w-5 h-5 text-blue-500" />,
  },
  {
    id: 'gapfill',
    label: '七选五',
    desc: '从选项中选出最佳句子填入短文',
    icon: <FileText className="w-5 h-5 text-emerald-500" />,
  },
  {
    id: 'cloze',
    label: '完形填空',
    desc: '语境理解，词义辨析',
    icon: <AlignLeft className="w-5 h-5 text-violet-500" />,
  },
  {
    id: 'listening',
    label: '听力理解',
    desc: '播放音频，选择正确答案',
    icon: <Headphones className="w-5 h-5 text-sky-500" />,
  },
];

const COUNTS = [10, 20, 30];

export const PracticeSetup: React.FC<PracticeSetupProps> = ({
  totalByCategory,
  onStart,
  onBack,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [questionCount, setQuestionCount] = useState(20);

  const totalAvailable =
    selectedCategory === 'all'
      ? Object.values(totalByCategory).reduce((a, b) => a + b, 0)
      : totalByCategory[selectedCategory] ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </button>

        <h2 className="text-2xl font-bold text-slate-900 mb-1">专项训练</h2>
        <p className="text-slate-500 text-sm mb-8">选择题型和数量，即时查看解析</p>

        {/* Category selection */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">题型选择</p>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                selectedCategory === 'all'
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-blue-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-800 text-sm">全部题型</p>
                  <p className="text-xs text-slate-500">混合练习</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                {Object.values(totalByCategory).reduce((a, b) => a + b, 0)} 题
              </span>
            </button>

            {CATEGORIES.map((cat) => {
              const count = totalByCategory[cat.id] ?? 0;
              if (count === 0) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    selectedCategory === cat.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                      {cat.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-800 text-sm">{cat.label}</p>
                      <p className="text-xs text-slate-500">{cat.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    {count} 题
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question count */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">题数</p>
          <div className="flex gap-3">
            {COUNTS.map((c) => (
              <button
                key={c}
                onClick={() => setQuestionCount(Math.min(c, totalAvailable))}
                disabled={totalAvailable < c}
                className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  questionCount === Math.min(c, totalAvailable) && c <= totalAvailable
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : totalAvailable < c
                    ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200'
                }`}
              >
                {c} 题
              </button>
            ))}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={() =>
            onStart({
              mode: 'practice',
              category: selectedCategory === 'all' ? undefined : selectedCategory,
              questionCount: Math.min(questionCount, totalAvailable),
            })
          }
          disabled={totalAvailable === 0}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-200 hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          开始练习 → {Math.min(questionCount, totalAvailable)} 题
        </button>
      </div>
    </div>
  );
};
