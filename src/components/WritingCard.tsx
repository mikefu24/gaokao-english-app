/**
 * Card for open-ended writing / continuation questions.
 * Displays the passage (for continuation), the writing prompt,
 * a textarea for student input, and a live word count.
 */

import React, { useMemo } from 'react';
import { PenLine, Bot } from 'lucide-react';
import type { Question } from '../types';
import { DIFFICULTY_COLOR, DIFFICULTY_LABEL } from '../utils/scoring';

interface WritingCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  userText: string;
  onChangeText: (text: string) => void;
  /** Practice mode: user has clicked "完成" — show AI score button */
  submitted: boolean;
  onSubmitDraft: () => void;  // "完成本题" in practice mode
  onAIScore?: () => void;     // available after submitted
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export const WritingCard: React.FC<WritingCardProps> = ({
  question,
  questionIndex,
  totalQuestions,
  userText,
  onChangeText,
  submitted,
  onSubmitDraft,
  onAIScore,
}) => {
  const wordCount = useMemo(() => countWords(userText), [userText]);
  const min = question.word_count_min ?? 0;
  const max = question.word_count_max ?? Infinity;
  const isContinuation = question.category === 'continuation';

  const wordCountColor =
    wordCount === 0
      ? 'text-slate-400'
      : wordCount < min
      ? 'text-rose-500'
      : wordCount > max
      ? 'text-amber-500'
      : 'text-emerald-600';

  const regionLabel = question.exam_id.startsWith('NK1') ? '新课标Ⅰ卷' : '浙江卷';

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-violet-100 text-violet-700 flex items-center gap-1">
            <PenLine className="w-3 h-3" />
            {question.category_display}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${DIFFICULTY_COLOR[question.difficulty]}`}>
            {DIFFICULTY_LABEL[question.difficulty]}
          </span>
          <span className="text-xs text-slate-400">{question.year}年 · {regionLabel}</span>
        </div>
        <span className="text-sm text-slate-400 font-medium">
          {questionIndex + 1} / {totalQuestions}
        </span>
      </div>

      {/* Passage — only for continuation */}
      {isContinuation && question.passage && (
        <div className="mb-5 rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">原文（阅读材料）</p>
          </div>
          <div className="p-4 bg-slate-50 max-h-56 overflow-y-auto">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{question.passage}</p>
          </div>
        </div>
      )}

      {/* Writing prompt */}
      <div className="mb-5 p-4 bg-violet-50 border border-violet-200 rounded-2xl">
        <p className="text-xs font-semibold text-violet-500 uppercase tracking-wide mb-2">
          {isContinuation ? '续写要求' : '写作要求'}
        </p>
        <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{question.question}</p>
        {/* Paragraph start prompts for continuation */}
        {isContinuation && (question.para1_start || question.para2_start) && (
          <div className="mt-3 space-y-2">
            {question.para1_start && (
              <div className="bg-white rounded-xl p-3 border border-violet-100">
                <p className="text-xs text-violet-400 font-medium mb-1">第一段开头：</p>
                <p className="text-sm text-slate-700 italic">{question.para1_start}</p>
              </div>
            )}
            {question.para2_start && (
              <div className="bg-white rounded-xl p-3 border border-violet-100">
                <p className="text-xs text-violet-400 font-medium mb-1">第二段开头：</p>
                <p className="text-sm text-slate-700 italic">{question.para2_start}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Word count requirement hint */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500">
          {min > 0 && max < Infinity
            ? `字数要求：${min}–${max} 词`
            : min > 0
            ? `最少 ${min} 词`
            : max < Infinity
            ? `最多 ${max} 词`
            : '开放作答'}
        </p>
        <span className={`text-xs font-semibold tabular-nums ${wordCountColor}`}>
          {wordCount} 词
        </span>
      </div>

      {/* Textarea */}
      <textarea
        value={userText}
        onChange={(e) => onChangeText(e.target.value)}
        disabled={submitted}
        placeholder={
          isContinuation
            ? '请根据原文续写故事…'
            : '请在此输入你的英语作文…'
        }
        rows={isContinuation ? 10 : 8}
        className={`w-full resize-y rounded-2xl border p-4 text-sm text-slate-800 leading-relaxed placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all ${
          submitted
            ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
            : 'bg-white border-slate-300 hover:border-violet-300'
        }`}
      />

      {/* Scoring criteria reminder */}
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
        {isContinuation ? (
          <>
            <span className="px-2 py-0.5 rounded-md bg-slate-100">内容分 10分</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100">语言分 15分</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100">共 25分</span>
          </>
        ) : (
          <>
            <span className="px-2 py-0.5 rounded-md bg-slate-100">任务完成度</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100">语言准确性</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100">共 15分</span>
          </>
        )}
      </div>

      {/* Practice mode: submit draft button */}
      {!submitted && (
        <button
          onClick={onSubmitDraft}
          disabled={wordCount === 0}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          完成本题，获取 AI 批改
        </button>
      )}

      {/* After submit: AI score button */}
      {submitted && onAIScore && (
        <button
          onClick={onAIScore}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-violet-200 bg-violet-50 text-violet-700 text-sm font-medium hover:bg-violet-100 hover:border-violet-300 transition-colors"
        >
          <Bot className="w-4 h-4" />
          AI 批改作文
        </button>
      )}
    </div>
  );
};
