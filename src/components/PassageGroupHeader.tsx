/**
 * Shows before the first question of each new passage group.
 * Displays the full text so students can read before answering.
 * Used for: 阅读理解 (Text A-D), 七选五, 完形填空
 */

import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import type { Category } from '../types';

interface PassageGroupHeaderProps {
  passageSource: string;   // e.g. "2023年1月 浙江卷 · Text A (Q21-Q24)"
  articleLabel?: string;   // 'A' | 'B' | 'C' | 'D' — for reading only
  category: Category;
  questionCount: number;
  passage: string;         // full text
}

// Reading article colors (by label A-D)
const READING_COLORS: Record<string, { border: string; badge: string; accent: string; btn: string }> = {
  A: { border: 'border-blue-200 bg-blue-50',    badge: 'bg-blue-100 text-blue-700',    accent: 'text-blue-600',    btn: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200' },
  B: { border: 'border-violet-200 bg-violet-50', badge: 'bg-violet-100 text-violet-700', accent: 'text-violet-600', btn: 'bg-violet-100 text-violet-700 hover:bg-violet-200 border-violet-200' },
  C: { border: 'border-emerald-200 bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700', accent: 'text-emerald-600', btn: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200' },
  D: { border: 'border-amber-200 bg-amber-50',  badge: 'bg-amber-100 text-amber-700',  accent: 'text-amber-600',  btn: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200' },
};

// Category-level colors for 七选五 / 完形填空
const CATEGORY_COLORS: Partial<Record<Category, { border: string; badge: string; accent: string; btn: string }>> = {
  gapfill: { border: 'border-teal-200 bg-teal-50', badge: 'bg-teal-100 text-teal-700', accent: 'text-teal-600', btn: 'bg-teal-100 text-teal-700 hover:bg-teal-200 border-teal-200' },
  cloze:   { border: 'border-purple-200 bg-purple-50', badge: 'bg-purple-100 text-purple-700', accent: 'text-purple-600', btn: 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200' },
};

const CATEGORY_LABEL: Partial<Record<Category, string>> = {
  reading: '阅读理解',
  gapfill: '七选五',
  cloze:   '完形填空',
};

const CATEGORY_HINT: Partial<Record<Category, string>> = {
  reading: '请先阅读原文再作答',
  gapfill: '阅读短文，从A–G中选句填入各空',
  cloze:   '通读全文，再逐题选词填空',
};

function getColors(category: Category, articleLabel?: string) {
  if (category === 'reading' && articleLabel) {
    return READING_COLORS[articleLabel] ?? READING_COLORS['A'];
  }
  return CATEGORY_COLORS[category] ?? READING_COLORS['A'];
}

export const PassageGroupHeader: React.FC<PassageGroupHeaderProps> = ({
  passageSource,
  articleLabel,
  category,
  questionCount,
  passage,
}) => {
  const [expanded, setExpanded] = useState(true);
  const colors = getColors(category, articleLabel);

  const label = articleLabel ? `Text ${articleLabel}` : (CATEGORY_LABEL[category] ?? category);
  const hint = CATEGORY_HINT[category] ?? '请先阅读原文再作答';

  // Split passage into paragraphs for nicer rendering
  const paragraphs = passage
    ? passage.split('\n').map(p => p.trim()).filter(Boolean)
    : [];

  return (
    <div className={`rounded-2xl border ${colors.border} mb-4 animate-slide-up overflow-hidden`}>
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
            <FileText className={`w-4 h-4 ${colors.accent}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${colors.badge}`}>
                {label}
              </span>
              <span className="text-xs text-slate-500">{passageSource}</span>
            </div>
            <p className="text-sm font-medium text-slate-700 mt-0.5">
              共 {questionCount} 题 · {hint}
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(e => !e)}
          className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-medium rounded-xl px-3 py-2 border transition-all whitespace-nowrap ${colors.btn}`}
        >
          {expanded ? (
            <><ChevronUp className="w-3.5 h-3.5" />收起</>
          ) : (
            <><ChevronDown className="w-3.5 h-3.5" />展开原文</>
          )}
        </button>
      </div>

      {/* Passage text */}
      {expanded && (
        <div className="px-4 pb-4">
          <div className="bg-white/80 rounded-xl border border-white p-4 max-h-80 overflow-y-auto">
            {paragraphs.length > 0 ? (
              <div className="space-y-3">
                {paragraphs.map((para, i) => (
                  <p key={i} className="text-sm text-slate-700 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">暂无原文</p>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2 text-right">
            ↑ 阅读完毕后向下作答
          </p>
        </div>
      )}
    </div>
  );
};
