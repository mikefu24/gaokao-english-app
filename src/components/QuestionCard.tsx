import React from 'react';
import { Bot } from 'lucide-react';
import type { Question } from '../types';
import { OptionButton } from './OptionButton';
import { DIFFICULTY_LABEL, DIFFICULTY_COLOR } from '../utils/scoring';

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  revealed: boolean; // practice mode: show correct/wrong
  onSelectAnswer: (letter: string) => void;
  onAIExplain?: () => void; // available after answer revealed
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  revealed,
  onSelectAnswer,
  onAIExplain,
}) => {
  const optionLetters = Object.keys(question.options).sort();
  const regionLabel = question.exam_id.startsWith('NK1') ? '新课标Ⅰ卷' : '浙江卷';

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
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

      {/* Passage excerpt — only for non-grouped questions (cloze etc.)
          Reading comprehension passages are shown in PassageGroupHeader */}
      {question.passage && !question.passage_group_id && (
        <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-600 leading-relaxed max-h-48 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">原文节选</p>
          <p className="whitespace-pre-wrap">{question.passage}</p>
        </div>
      )}

      {/* Question text */}
      <div className="mb-6">
        <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
          {question.question}
        </p>
      </div>

      {/* Options — 七选五 has 7 options so use compact layout */}
      <div className="space-y-2">
        {optionLetters.map((letter) => (
          <OptionButton
            key={letter}
            letter={letter}
            text={question.options[letter]}
            selected={selectedAnswer === letter}
            revealed={revealed}
            correct={revealed && letter === question.answer}
            onClick={() => onSelectAnswer(letter)}
          />
        ))}
      </div>

      {/* Explanation (shown after reveal) */}
      {revealed && question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">解析</p>
          <p className="text-sm text-blue-900 leading-relaxed">{question.explanation}</p>
        </div>
      )}

      {/* Correct answer reveal without explanation */}
      {revealed && !question.explanation && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-sm text-emerald-700 font-medium">
            ✓ 正确答案：{question.answer}
          </p>
        </div>
      )}

      {/* AI Explain button — shows after reveal */}
      {revealed && onAIExplain && (
        <button
          onClick={onAIExplain}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-violet-200 bg-violet-50 text-violet-700 text-sm font-medium hover:bg-violet-100 hover:border-violet-300 transition-colors"
        >
          <Bot className="w-4 h-4" />
          AI 讲解这道题
        </button>
      )}
    </div>
  );
};
