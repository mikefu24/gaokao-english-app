/**
 * Shows before the first question of each new reading passage group.
 * Tells the student which article they need to read before answering.
 */

import React, { useState } from 'react';
import { FileText, Copy, Check } from 'lucide-react';

interface PassageGroupHeaderProps {
  passageSource: string;   // e.g. "2023年1月 浙江卷 · Text A (Q21-Q24)"
  articleLabel: string;    // 'A' | 'B' | 'C' | 'D'
  questionCount: number;
}

const ARTICLE_COLORS: Record<string, string> = {
  A: 'border-blue-200 bg-blue-50',
  B: 'border-violet-200 bg-violet-50',
  C: 'border-emerald-200 bg-emerald-50',
  D: 'border-amber-200 bg-amber-50',
};

const BADGE_COLORS: Record<string, string> = {
  A: 'bg-blue-100 text-blue-700',
  B: 'bg-violet-100 text-violet-700',
  C: 'bg-emerald-100 text-emerald-700',
  D: 'bg-amber-100 text-amber-700',
};

/** Build a concise search keyword the student can paste anywhere */
function buildSearchTerm(passageSource: string): string {
  // e.g. "2025年6月 浙江卷 · Text C (Q29-Q32)"
  // → "2025年6月 浙江卷 高考英语阅读理解 Text C 原文"
  const clean = passageSource.replace(/\s*·\s*Text\s+[A-D]\s*\(Q[\d-]+\)/, '');
  const textMatch = passageSource.match(/Text ([A-D])/);
  const textLabel = textMatch ? ` Text ${textMatch[1]}` : '';
  return `${clean.trim()} 高考英语阅读理解${textLabel} 原文`;
}

export const PassageGroupHeader: React.FC<PassageGroupHeaderProps> = ({
  passageSource,
  articleLabel,
  questionCount,
}) => {
  const [copied, setCopied] = useState(false);

  const colorCls = ARTICLE_COLORS[articleLabel] ?? ARTICLE_COLORS['A'];
  const badgeCls = BADGE_COLORS[articleLabel] ?? BADGE_COLORS['A'];
  const searchTerm = buildSearchTerm(passageSource);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(searchTerm);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
      const el = document.createElement('textarea');
      el.value = searchTerm;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`rounded-2xl border ${colorCls} p-4 mb-4 animate-slide-up`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${badgeCls}`}>
                Text {articleLabel}
              </span>
              <span className="text-xs text-slate-500 truncate">{passageSource}</span>
            </div>
            <p className="text-sm font-medium text-slate-700 mt-1">
              阅读理解 · 共 {questionCount} 题
            </p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              请先找到原卷阅读原文，再作答以下题目
            </p>
          </div>
        </div>

        {/* Copy search term button — works everywhere, no external URL */}
        <button
          onClick={handleCopy}
          className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-medium rounded-xl px-3 py-2 border transition-all whitespace-nowrap ${
            copied
              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
          title={`复制搜索词：${searchTerm}`}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              已复制
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              复制搜索词
            </>
          )}
        </button>
      </div>

      {/* Copyable search term preview */}
      <div
        className="mt-3 px-3 py-2 rounded-lg bg-white/70 border border-white text-xs text-slate-500 font-mono cursor-pointer select-all"
        onClick={handleCopy}
        title="点击复制"
      >
        {searchTerm}
      </div>
    </div>
  );
};
