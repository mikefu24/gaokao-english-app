/**
 * Sliding panel for AI scoring of writing / continuation questions.
 * Streams feedback from Claude, similar in structure to AIPanel.
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Bot, Loader2, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import type { Question } from '../types';
import { scoreEssay, scoreContinuation, hasApiKey } from '../services/ai';

interface AIWritingPanelProps {
  question: Question;
  userText: string;
  onClose: () => void;
  onNeedKey: () => void;
}

export const AIWritingPanel: React.FC<AIWritingPanelProps> = ({
  question,
  userText,
  onClose,
  onNeedKey,
}) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isContinuation = question.category === 'continuation';

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

    const onChunk = (chunk: string) => {
      if (cancelled) return;
      setText((prev) => prev + chunk);
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    };

    const promise = isContinuation
      ? scoreContinuation(userText, question.passage ?? '', question.question, onChunk)
      : scoreEssay(userText, question.question, onChunk);

    promise
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
  }, [question.id, userText]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white w-full max-w-2xl mx-auto rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">
                AI 作文批改
              </p>
              <p className="text-xs text-slate-400">
                {isContinuation ? '读后续写 · 满分25分' : '应用文写作 · 满分15分'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Student text preview */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex-shrink-0">
          <p className="text-xs text-slate-400 font-medium mb-1">你的作文</p>
          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{userText}</p>
        </div>

        {/* Scrollable feedback */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
          {loading && !text && (
            <div className="flex items-center gap-2 text-violet-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">AI 正在批改中…</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-rose-600 bg-rose-50 rounded-xl p-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">批改出错</p>
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
            <>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <Sparkles className="w-3 h-3" />
                <span>批改完成</span>
              </div>

              {/* Sample answer toggle */}
              {question.sample_answer && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowSample((v) => !v)}
                    className="flex items-center gap-2 text-xs text-violet-600 font-medium hover:text-violet-800 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    {showSample ? '收起参考范文' : '查看参考范文'}
                  </button>
                  {showSample && (
                    <div className="mt-3 p-4 bg-violet-50 border border-violet-200 rounded-xl">
                      <p className="text-xs font-semibold text-violet-600 mb-2">参考范文</p>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {question.sample_answer}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Markdown-lite renderer (reused from AIPanel) ──────────────────────────────

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
        if (line.trim() === '') return <div key={i} className="h-2" />;
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
