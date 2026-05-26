/**
 * Shows before the first question of each new passage group.
 * Displays the full text so students can read before answering.
 * Used for: 阅读理解 (Text A-D), 七选五, 完形填空, 听力理解
 */

import React, { useState, useRef } from 'react';
import { FileText, ChevronDown, ChevronUp, Headphones, Play, Pause, RotateCcw } from 'lucide-react';
import type { Category } from '../types';

interface PassageGroupHeaderProps {
  passageSource: string;   // e.g. "2023年1月 浙江卷 · Text A (Q21-Q24)"
  articleLabel?: string;   // 'A' | 'B' | 'C' | 'D' — for reading only
  category: Category;
  questionCount: number;
  passage: string;         // full text / transcript
  audioFile?: string;      // filename under /audio/, e.g. 'listen_zj_2026.mp3'
}

// Reading article colors (by label A-D)
const READING_COLORS: Record<string, { border: string; badge: string; accent: string; btn: string }> = {
  A: { border: 'border-blue-200 bg-blue-50',    badge: 'bg-blue-100 text-blue-700',    accent: 'text-blue-600',    btn: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200' },
  B: { border: 'border-violet-200 bg-violet-50', badge: 'bg-violet-100 text-violet-700', accent: 'text-violet-600', btn: 'bg-violet-100 text-violet-700 hover:bg-violet-200 border-violet-200' },
  C: { border: 'border-emerald-200 bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700', accent: 'text-emerald-600', btn: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200' },
  D: { border: 'border-amber-200 bg-amber-50',  badge: 'bg-amber-100 text-amber-700',  accent: 'text-amber-600',  btn: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200' },
};

// Category-level colors for 七选五 / 语法填空 / 完形填空 / 听力
const CATEGORY_COLORS: Partial<Record<Category, { border: string; badge: string; accent: string; btn: string }>> = {
  seven_choice: { border: 'border-orange-200 bg-orange-50', badge: 'bg-orange-100 text-orange-700', accent: 'text-orange-600', btn: 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200' },
  gapfill:      { border: 'border-teal-200 bg-teal-50', badge: 'bg-teal-100 text-teal-700', accent: 'text-teal-600', btn: 'bg-teal-100 text-teal-700 hover:bg-teal-200 border-teal-200' },
  cloze:        { border: 'border-purple-200 bg-purple-50', badge: 'bg-purple-100 text-purple-700', accent: 'text-purple-600', btn: 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200' },
  listening:    { border: 'border-sky-200 bg-sky-50', badge: 'bg-sky-100 text-sky-700', accent: 'text-sky-600', btn: 'bg-sky-100 text-sky-700 hover:bg-sky-200 border-sky-200' },
};

const CATEGORY_LABEL: Partial<Record<Category, string>> = {
  reading:      '阅读理解',
  seven_choice: '七选五',
  gapfill:      '语法填空',
  cloze:        '完形填空',
  listening:    '听力理解',
};

const CATEGORY_HINT: Partial<Record<Category, string>> = {
  reading:      '请先阅读原文再作答',
  seven_choice: '阅读短文，从A–G中选句填入各空',
  gapfill:      '阅读短文，在空白处填入适当的词或所给单词的正确形式',
  cloze:        '通读全文，再逐题选词填空',
  listening:    '请先播放音频，仔细听后再作答',
};

function getColors(category: Category, articleLabel?: string) {
  if (category === 'reading' && articleLabel) {
    return READING_COLORS[articleLabel] ?? READING_COLORS['A'];
  }
  return CATEGORY_COLORS[category] ?? READING_COLORS['A'];
}

// ── Audio Player Component ───────────────────────────────────────────────────

interface AudioPlayerProps {
  src: string;
  colors: { border: string; badge: string; accent: string; btn: string };
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, colors }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);   // 0-100
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const fmt = (s: number) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play(); setPlaying(true); }
  };

  const restart = () => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play();
    setPlaying(true);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    a.currentTime = ratio * duration;
  };

  return (
    <div className="bg-white/80 rounded-xl border border-white p-3 flex items-center gap-3">
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={e => { setDuration((e.target as HTMLAudioElement).duration); setLoaded(true); }}
        onTimeUpdate={e => {
          const a = e.target as HTMLAudioElement;
          setCurrentTime(a.currentTime);
          setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0);
        }}
        onEnded={() => { setPlaying(false); setProgress(100); }}
        preload="metadata"
      />

      {/* Play/Pause */}
      <button
        onClick={toggle}
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${colors.btn} border`}
      >
        {playing
          ? <Pause className="w-4 h-4" />
          : <Play className="w-4 h-4 ml-0.5" />}
      </button>

      {/* Progress bar */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div
          className="h-2 bg-slate-100 rounded-full cursor-pointer overflow-hidden"
          onClick={seek}
        >
          <div
            className="h-full bg-sky-400 rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>{fmt(currentTime)}</span>
          <span>{loaded ? fmt(duration) : '加载中…'}</span>
        </div>
      </div>

      {/* Restart */}
      <button
        onClick={restart}
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        title="重播"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────

export const PassageGroupHeader: React.FC<PassageGroupHeaderProps> = ({
  passageSource,
  articleLabel,
  category,
  questionCount,
  passage,
  audioFile,
}) => {
  const [expanded, setExpanded] = useState(category !== 'listening'); // transcript collapsed by default for listening
  const colors = getColors(category, articleLabel);
  const isListening = category === 'listening';

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
            {isListening
              ? <Headphones className={`w-4 h-4 ${colors.accent}`} />
              : <FileText className={`w-4 h-4 ${colors.accent}`} />
            }
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
            <><ChevronUp className="w-3.5 h-3.5" />{isListening ? '收起原文' : '收起'}</>
          ) : (
            <><ChevronDown className="w-3.5 h-3.5" />{isListening ? '查看原文' : '展开原文'}</>
          )}
        </button>
      </div>

      {/* Audio player — always visible for listening */}
      {isListening && audioFile && (
        <div className="px-4 pb-3">
          <AudioPlayer src={`/audio/${audioFile}`} colors={colors} />
        </div>
      )}

      {/* Passage / transcript text */}
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
          {isListening ? (
            <p className="text-xs text-slate-400 mt-2 text-right">↑ 听力原文（建议先作答再查看）</p>
          ) : (
            <p className="text-xs text-slate-400 mt-2 text-right">↑ 阅读完毕后向下作答</p>
          )}
        </div>
      )}
    </div>
  );
};
