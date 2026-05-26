/**
 * Card for 语法填空 (grammar gapfill) questions.
 * Shows a compact single-line input — very different from the big WritingCard.
 * The full passage is shown by PassageGroupHeader before the first question.
 */

import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Question } from '../types';
import { DIFFICULTY_COLOR, DIFFICULTY_LABEL } from '../utils/scoring';

interface GapfillCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  userText: string;
  onChangeText: (text: string) => void;
  /** practice mode: user has clicked confirm */
  submitted: boolean;
  onSubmit: () => void;
}

export const GapfillCard: React.FC<GapfillCardProps> = ({
  question,
  questionIndex,
  totalQuestions,
  userText,
  onChangeText,
  submitted,
  onSubmit,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(userText);

  // Sync external value (e.g. navigating back to this question)
  useEffect(() => {
    setLocalValue(userText);
  }, [question.id, userText]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocalValue(v);
    onChangeText(v);
  };

  const handleConfirm = () => {
    if (!submitted && localValue.trim()) {
      onSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
  };

  const correct = question.answer?.toLowerCase().trim();
  const userNorm = localValue.toLowerCase().trim();
  const isCorrect = submitted && userNorm === correct;
  const isWrong = submitted && userNorm !== correct;

  // Extract blank number from question text, e.g. "语法填空第56题" → "56"
  const blankNumMatch = question.question.match(/第(\d+)题/);
  const blankNum = blankNumMatch ? blankNumMatch[1] : String(question.number);

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-teal-100 text-teal-700">
            语法填空
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${DIFFICULTY_COLOR[question.difficulty]}`}>
            {DIFFICULTY_LABEL[question.difficulty]}
          </span>
        </div>
        <span className="text-sm text-slate-400 font-medium">
          {questionIndex + 1} / {totalQuestions}
        </span>
      </div>

      {/* Blank label */}
      <div className="mb-5 p-4 bg-teal-50 border border-teal-200 rounded-2xl">
        <p className="text-xs font-semibold text-teal-500 uppercase tracking-wide mb-1">填空</p>
        <p className="text-base font-medium text-slate-800">
          第 <span className="text-teal-700 font-bold">{blankNum}</span> 空
        </p>
        <p className="text-xs text-slate-500 mt-1">在上方原文中找到第 {blankNum} 个空白处，填入合适的词</p>
      </div>

      {/* Input area */}
      {!submitted ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={localValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="输入答案（一个单词）"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all bg-white"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              onClick={handleConfirm}
              disabled={!localValue.trim()}
              className="px-5 py-3 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              确认
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center">按 Enter 或点击确认查看答案</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* User's answer */}
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            isCorrect
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-rose-50 border-rose-200'
          }`}>
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            )}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">你的答案</p>
              <p className={`text-base font-semibold ${isCorrect ? 'text-emerald-700' : 'text-rose-600'}`}>
                {localValue || '（未填写）'}
              </p>
            </div>
          </div>

          {/* Correct answer (always shown) */}
          {isWrong && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">正确答案</p>
                <p className="text-base font-semibold text-emerald-700">{question.answer}</p>
              </div>
            </div>
          )}

          {/* Explanation */}
          {question.explanation && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">解析</p>
              <p className="text-sm text-blue-900 leading-relaxed">{question.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
