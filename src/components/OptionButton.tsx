import React from 'react';

interface OptionButtonProps {
  letter: string;
  text: string;
  selected: boolean;
  revealed: boolean;
  correct: boolean;
  onClick: () => void;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  letter,
  text,
  selected,
  revealed,
  correct,
  onClick,
}) => {
  let containerCls =
    'flex items-start gap-3 w-full rounded-xl border p-4 text-left transition-all duration-150 cursor-pointer ';

  if (revealed) {
    if (correct) {
      containerCls += 'border-emerald-400 bg-emerald-50 text-emerald-900';
    } else if (selected && !correct) {
      containerCls += 'border-rose-400 bg-rose-50 text-rose-900';
    } else {
      containerCls += 'border-slate-200 bg-white text-slate-500 opacity-60';
    }
  } else if (selected) {
    containerCls += 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm';
  } else {
    containerCls +=
      'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50';
  }

  let badgeCls =
    'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ';

  if (revealed) {
    if (correct) {
      badgeCls += 'bg-emerald-500 text-white';
    } else if (selected && !correct) {
      badgeCls += 'bg-rose-500 text-white';
    } else {
      badgeCls += 'bg-slate-200 text-slate-400';
    }
  } else if (selected) {
    badgeCls += 'bg-blue-500 text-white';
  } else {
    badgeCls += 'bg-slate-100 text-slate-500';
  }

  return (
    <button className={containerCls} onClick={onClick} disabled={revealed}>
      <span className={badgeCls}>{letter}</span>
      <span className="leading-relaxed text-sm sm:text-base">{text}</span>
    </button>
  );
};
