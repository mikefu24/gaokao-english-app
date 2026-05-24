/**
 * Sliding panel that shows AI explanation for a question.
 * Uses streaming — text appears word by word.
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Bot, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import type { Question } from '../types';
import { explainQuestion, hasApiKey } from '../services/ai';

interface AIPanelProps {
  question: Question;
  userAnswer: string | null;
  onClose: () => void;
  onNeedKey: () => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({
  question,
  userAnswer,
  onClose,
  onNeedKey,
}) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasApiKey()) {
      onNeedKey();
      return;
    }

    let cancelled = false;
    setLoading(true);
    setText('');
    setError(null);
    setDone(false);

    explainQuestion(question, userAnswer, (chunk) => {
      if (cancelled) return;
      setText((prev) => prev + chunk);
      // auto-scroll
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    })
      .then(() => {
        if (!cancelled) {
          setDone(true);
          setLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [question.id, userAnswer]); // re-run if question changes

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white w-full max-w-2xl mx-auto rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">AI 题目讲解</p>
              <p className="text-xs text-slate-400">claude-sonnet-4-6</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Question preview */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex-shrink-0">
          <p className="text-xs text-slate-500 line-clamp-2">{question.question}</p>
          {userAnswer && (
            <span
              className={`mt-1 inline-block text-xs font-medium px-2 py-0.5 rounded-md ${
                userAnswer === question.answer
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              你选了 {userAnswer} · 正确答案 {question.answer}
            </span>
          )}
        </div>

        {/* Content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-4"
        >
          {loading && !text && (
            <div className="flex items-center gap-2 text-violet-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">正在生成解析…</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-rose-600 bg-rose-50 rounded-xl p-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">出错了</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {text && (
            <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed">
              <FormattedText text={text} />
              {loading && (
                <span className="inline-block w-0.5 h-4 bg-violet-500 animate-pulse ml-0.5 align-middle" />
              )}
            </div>
          )}

          {done && (
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-3 h-3" />
              <span>解析完成</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple markdown-lite renderer for the AI text
function FormattedText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return (
            <h3 key={i} className="font-semibold text-slate-900 mt-4 mb-1 text-sm">
              {line.slice(3)}
            </h3>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <h4 key={i} className="font-medium text-slate-800 mt-3 mb-1 text-sm">
              {line.slice(4)}
            </h4>
          );
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <div key={i} className="flex items-start gap-2 my-1">
              <span className="text-violet-400 mt-1 flex-shrink-0">•</span>
              <span className="text-sm"><InlineFormatted text={line.slice(2)} /></span>
            </div>
          );
        }
        if (line.trim() === '') {
          return <div key={i} className="h-2" />;
        }
        return (
          <p key={i} className="text-sm my-1">
            <InlineFormatted text={line} />
          </p>
        );
      })}
    </>
  );
}

function InlineFormatted({ text }: { text: string }) {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
