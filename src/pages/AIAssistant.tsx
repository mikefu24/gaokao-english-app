import React, { useState, useRef } from 'react';
import {
  ArrowLeft, Bot, FileText, Key, Loader2,
  AlertCircle, Sparkles, Settings
} from 'lucide-react';
import { scoreEssay, hasApiKey } from '../services/ai';
import { ApiKeyModal } from '../components/ApiKeyModal';

interface AIAssistantProps {
  onBack: () => void;
}

const SAMPLE_PROMPT = `假设你是高中生李华，你的英国朋友 Peter 想了解中国的传统节日。请给他写一封电子邮件，介绍你最喜欢的一个传统节日，包括：节日名称与时间、主要活动、节日意义。词数约 80 词。`;

export const AIAssistant: React.FC<AIAssistantProps> = ({ onBack }) => {
  const [tab, setTab] = useState<'essay' | 'about'>('essay');
  const [prompt, setPrompt] = useState(SAMPLE_PROMPT);
  const [essay, setEssay] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScore = async () => {
    if (!essay.trim()) return;
    if (!hasApiKey()) {
      setShowKeyModal(true);
      return;
    }
    setLoading(true);
    setResult('');
    setError(null);

    try {
      await scoreEssay(prompt, essay, (chunk) => {
        setResult((prev) => prev + chunk);
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        });
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Back + Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 返回首页
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-200">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">AI 助理</h2>
              <p className="text-slate-500 text-sm">claude-sonnet-4-6 驱动</p>
            </div>
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
              hasApiKey()
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50'
            }`}
          >
            <Key className="w-3 h-3" />
            {hasApiKey() ? '已配置 Key' : '配置 Key'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
          {([['essay', '作文评分', FileText], ['about', '关于 AI 功能', Settings]] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === id
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Essay tab */}
        {tab === 'essay' && (
          <div className="space-y-4">
            {/* Prompt */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                题目要求
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-none bg-white"
                placeholder="粘贴作文题目要求…"
              />
            </div>

            {/* Essay input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                你的作文
              </label>
              <textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-none bg-white"
                placeholder="在这里粘贴或输入你的英语作文…"
              />
              <p className="text-xs text-slate-400 mt-1 text-right">
                {essay.split(/\s+/).filter(Boolean).length} 词
              </p>
            </div>

            {/* Submit */}
            <button
              onClick={handleScore}
              disabled={!essay.trim() || loading}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-violet-700 text-white font-semibold rounded-2xl shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-violet-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> 评分中…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> AI 评分 & 点评
                </>
              )}
            </button>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 text-rose-600 bg-rose-50 rounded-xl p-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">出错了</p>
                  <p className="text-xs mt-0.5">{error}</p>
                  {error.includes('Key') && (
                    <button
                      onClick={() => setShowKeyModal(true)}
                      className="mt-2 text-xs underline"
                    >
                      配置 API Key →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Result */}
            {result && (
              <div
                ref={scrollRef}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Bot className="w-4 h-4 text-violet-500" />
                  <p className="text-sm font-semibold text-slate-700">AI 评分结果</p>
                  {loading && (
                    <Loader2 className="w-3 h-3 animate-spin text-violet-400 ml-auto" />
                  )}
                </div>
                <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed">
                  <FormattedText text={result} />
                  {loading && (
                    <span className="inline-block w-0.5 h-4 bg-violet-500 animate-pulse ml-0.5 align-middle" />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* About tab */}
        {tab === 'about' && (
          <div className="space-y-4">
            <InfoCard
              title="AI 题目讲解"
              status="已上线"
              statusColor="emerald"
              desc="在做题/练习时，答题后点击「AI 讲解这道题」按钮，Claude 会即时分析正确答案理由、错误选项排除逻辑和解题技巧。"
            />
            <InfoCard
              title="AI 作文评分"
              status="已上线"
              statusColor="emerald"
              desc="在本页「作文评分」标签粘贴题目和作文，Claude 按高考五档评分法给出综合评分、各维度点评和修改建议。"
            />
            <InfoCard
              title="AI 个性化推荐"
              status="规划中"
              statusColor="amber"
              desc="根据错题记录和练习历史，智能推荐薄弱题型和专项训练方案。"
            />

            <div className="bg-slate-800 rounded-2xl p-5 mt-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">隐私说明</p>
              <p className="text-slate-300 text-xs leading-relaxed">
                你的 API Key 仅存储在本浏览器的 localStorage 中，不会发送到任何第三方服务器。
                题目和作文内容直接发送至 Anthropic API，受 Anthropic 隐私政策保护。
              </p>
            </div>
          </div>
        )}
      </div>

      {showKeyModal && (
        <ApiKeyModal
          onClose={() => setShowKeyModal(false)}
          onSaved={() => setShowKeyModal(false)}
        />
      )}
    </div>
  );
};

// ── helpers ───────────────────────────────────────────────────────────────────

function FormattedText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => {
        if (line.startsWith('## ')) {
          return <h3 key={i} className="font-semibold text-slate-900 mt-4 mb-1 text-sm">{line.slice(3)}</h3>;
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <div key={i} className="flex items-start gap-2 my-1">
              <span className="text-violet-400 mt-1 flex-shrink-0">•</span>
              <span className="text-sm">{boldify(line.slice(2))}</span>
            </div>
          );
        }
        if (line.trim() === '') return <div key={i} className="h-2" />;
        return <p key={i} className="text-sm my-1">{boldify(line)}</p>;
      })}
    </>
  );
}

function boldify(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} className="font-semibold text-slate-900">{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
}

function InfoCard({ title, status, statusColor, desc }: {
  title: string; status: string; statusColor: 'emerald' | 'amber'; desc: string;
}) {
  const colors = {
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <p className="font-semibold text-slate-800 text-sm">{title}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[statusColor]}`}>
          {status}
        </span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
