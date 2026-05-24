/**
 * Shows before the first question of each new reading passage group.
 * Tells the student which article they need to read before answering.
 */

import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';

interface PassageGroupHeaderProps {
  passageSource: string;   // e.g. "2023年1月 浙江卷 · Text A (Q21-Q24)"
  articleLabel: string;    // 'A' | 'B' | 'C' | 'D'
  questionCount: number;
}

const ARTICLE_COLORS: Record<string, string> = {
  A: 'from-blue-50 to-blue-50 border-blue-200',
  B: 'from-violet-50 to-violet-50 border-violet-200',
  C: 'from-emerald-50 to-emerald-50 border-emerald-200',
  D: 'from-amber-50 to-amber-50 border-amber-200',
};

const BADGE_COLORS: Record<string, string> = {
  A: 'bg-blue-100 text-blue-700',
  B: 'bg-violet-100 text-violet-700',
  C: 'bg-emerald-100 text-emerald-700',
  D: 'bg-amber-100 text-amber-700',
};

// Best-effort search links by year/exam (fallback to gaokao general search)
function getSearchUrl(passageSource: string): string {
  const yearMatch = passageSource.match(/(\d{4})年/);
  const monthMatch = passageSource.match(/(\d+)月/);
  if (yearMatch && monthMatch) {
    const year = yearMatch[1];
    const month = monthMatch[1];
    const region = passageSource.includes('浙江') ? '浙江' : '全国';
    return `https://www.baidu.com/s?wd=${encodeURIComponent(`${year}年${month}月${region}高考英语真题 阅读理解 Text ${passageSource.match(/Text ([A-D])/)?.[1] ?? ''}`)}`;
  }
  return 'https://www.baidu.com/s?wd=高考英语真题阅读理解原文';
}

export const PassageGroupHeader: React.FC<PassageGroupHeaderProps> = ({
  passageSource,
  articleLabel,
  questionCount,
}) => {
  const colorCls = ARTICLE_COLORS[articleLabel] ?? ARTICLE_COLORS['A'];
  const badgeCls = BADGE_COLORS[articleLabel] ?? BADGE_COLORS['A'];

  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${colorCls} p-4 mb-4 animate-slide-up`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${badgeCls}`}>
                Text {articleLabel}
              </span>
              <span className="text-xs text-slate-500">{passageSource}</span>
            </div>
            <p className="text-sm font-medium text-slate-700 mt-1">
              阅读理解 · 共 {questionCount} 题
            </p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              ⚠️ 请先在原卷中找到此篇阅读材料，阅读完成后再作答以下题目
            </p>
          </div>
        </div>

        <a
          href={getSearchUrl(passageSource)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 bg-white rounded-lg px-2.5 py-1.5 border border-slate-200 hover:border-blue-200 transition-colors whitespace-nowrap"
        >
          查原卷
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
