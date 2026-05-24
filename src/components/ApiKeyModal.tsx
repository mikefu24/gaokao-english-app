/**
 * Modal to input / update the Anthropic API Key.
 */

import React, { useState } from 'react';
import { X, Key, Eye, EyeOff, ExternalLink, ShieldCheck } from 'lucide-react';
import { setApiKey, getApiKey } from '../services/ai';

interface ApiKeyModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose, onSaved }) => {
  const [value, setValue] = useState(getApiKey());
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiKey(value);
    setSaved(true);
    setTimeout(() => {
      onSaved();
    }, 600);
  };

  const masked = value
    ? value.slice(0, 7) + '•'.repeat(Math.max(0, value.length - 10)) + value.slice(-3)
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <Key className="w-4 h-4 text-violet-600" />
            </div>
            <p className="font-semibold text-slate-800">输入 API Key</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Security note */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Key 仅保存在你的浏览器 localStorage 中，不会上传到任何服务器。这是个人使用工具，适合自用。
            </p>
          </div>

          {/* Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Anthropic API Key
            </label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-slate-50"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {value && !show && (
              <p className="mt-1 text-xs text-slate-400 font-mono">{masked}</p>
            )}
          </div>

          {/* Get key link */}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800"
          >
            <ExternalLink className="w-3 h-3" />
            获取 Anthropic API Key →
          </a>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!value.trim() || saved}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
              saved
                ? 'bg-emerald-500 text-white'
                : 'bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40'
            }`}
          >
            {saved ? '✓ 已保存' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
};
