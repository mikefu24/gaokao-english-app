import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  answered: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, answered }) => {
  const pct = Math.round((answered / total) * 100);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span>第 {current}/{total} 题</span>
        <span>已作答 {pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
