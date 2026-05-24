import React from 'react';
import { BookOpen, Target, AlertCircle, Bot, TrendingUp, ChevronRight, Award, Settings, Headphones } from 'lucide-react';
import type { UserProgress, ExamConfig } from '../types';
import { hasApiKey } from '../services/ai';

interface HomeProps {
  progress: UserProgress;
  onStartExam: (config: ExamConfig) => void;
  onViewWrongBook: () => void;
  onViewAI: () => void;
  onSettings: () => void;
  onListening: () => void;
}

export const Home: React.FC<HomeProps> = ({
  progress,
  onStartExam,
  onViewWrongBook,
  onViewAI,
  onSettings,
  onListening,
}) => {
  const aiConfigured = hasApiKey();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="text-center mb-10 relative">
          {/* Settings button */}
          <button
            onClick={onSettings}
            className={`absolute right-0 top-0 p-2 rounded-xl transition-colors ${
              aiConfigured
                ? 'text-emerald-500 hover:bg-emerald-50'
                : 'text-slate-400 hover:bg-slate-100'
            }`}
            title={aiConfigured ? 'AI 已配置' : '配置 AI Key'}
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">高考英语</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            浙江真题练习
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            2018–2025 年历年真题 · 智能错题本 · AI 解析
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard
            label="已作答"
            value={progress.totalAttempted}
            unit="题"
            icon={<TrendingUp className="w-4 h-4" />}
            color="blue"
          />
          <StatCard
            label="正确率"
            value={progress.totalAttempted > 0 ? progress.accuracy : '--'}
            unit={progress.totalAttempted > 0 ? '%' : ''}
            icon={<Award className="w-4 h-4" />}
            color="emerald"
          />
          <StatCard
            label="错题数"
            value={progress.wrongQuestionIds.length}
            unit="题"
            icon={<AlertCircle className="w-4 h-4" />}
            color="rose"
          />
        </div>

        {/* Main actions */}
        <div className="space-y-3 mb-6">
          <SectionLabel>开始练习</SectionLabel>

          <ModeCard
            icon={<BookOpen className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-50"
            title="真题模拟卷"
            description="计时作答，模拟真实高考体验"
            tag="30 题 · 45 分钟"
            onClick={() =>
              onStartExam({
                mode: 'exam',
                questionCount: 30,
                durationMinutes: 45,
              })
            }
          />

          <ModeCard
            icon={<Target className="w-5 h-5 text-violet-600" />}
            iconBg="bg-violet-50"
            title="专项训练"
            description="按题型精准练习，即时查看解析"
            tag="阅读 · 完形 · 语法"
            onClick={() => onStartExam({ mode: 'practice' })}
          />

          <ModeCard
            icon={<Headphones className="w-5 h-5 text-sky-600" />}
            iconBg="bg-sky-50"
            title="听力专项"
            description="真题听力音频 + 题目，11套历年真题"
            tag="2017–2025 · 11套"
            onClick={onListening}
          />

          {progress.wrongQuestionIds.length > 0 && (
            <ModeCard
              icon={<AlertCircle className="w-5 h-5 text-rose-500" />}
              iconBg="bg-rose-50"
              title="错题强化"
              description={`共 ${progress.wrongQuestionIds.length} 道错题，专项攻克`}
              tag="错题重练"
              onClick={() =>
                onStartExam({
                  mode: 'practice',
                  questionIds: progress.wrongQuestionIds,
                })
              }
            />
          )}
        </div>

        {/* Secondary actions */}
        <div className="space-y-2">
          <SectionLabel>工具</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <SecondaryCard
              icon={<AlertCircle className="w-4 h-4 text-rose-500" />}
              label="错题本"
              count={progress.wrongQuestionIds.length}
              onClick={onViewWrongBook}
            />
            <SecondaryCard
              icon={<Bot className="w-4 h-4 text-violet-500" />}
              label="AI 助理"
              onClick={onViewAI}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-1 mb-1">
    {children}
  </p>
);

interface StatCardProps {
  label: string;
  value: number | string;
  unit: string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'rose';
}

const colorMap = {
  blue: 'text-blue-600 bg-blue-50',
  emerald: 'text-emerald-600 bg-emerald-50',
  rose: 'text-rose-600 bg-rose-50',
};

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, icon, color }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
    <div className={`inline-flex p-1.5 rounded-lg ${colorMap[color]} mb-2`}>{icon}</div>
    <div className="text-xl font-bold text-slate-800">
      {value}<span className="text-sm font-normal text-slate-400 ml-0.5">{unit}</span>
    </div>
    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
  </div>
);

interface ModeCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  tag: string;
  onClick: () => void;
}

const ModeCard: React.FC<ModeCardProps> = ({ icon, iconBg, title, description, tag, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-150 text-left"
  >
    <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-slate-800 text-sm">{title}</p>
      <p className="text-xs text-slate-500 mt-0.5 truncate">{description}</p>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
        {tag}
      </span>
      <ChevronRight className="w-4 h-4 text-slate-400" />
    </div>
  </button>
);

interface SecondaryCardProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
  onClick: () => void;
}

const SecondaryCard: React.FC<SecondaryCardProps> = ({ icon, label, count, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-between gap-2 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-150 w-full"
  >
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </div>
    {count !== undefined && count > 0 && (
      <span className="text-xs font-semibold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
        {count}
      </span>
    )}
    <ChevronRight className="w-4 h-4 text-slate-400" />
  </button>
);
