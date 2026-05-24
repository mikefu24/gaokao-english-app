import React, { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { formatTime } from '../utils/scoring';

interface TimerProps {
  durationSeconds: number;
  onTimeUp: () => void;
  paused?: boolean;
}

export const Timer: React.FC<TimerProps> = ({ durationSeconds, onTimeUp, paused = false }) => {
  const [remaining, setRemaining] = useState(durationSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current!);
          onTimeUpRef.current();
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused]);

  const pct = remaining / durationSeconds;
  const isWarning = pct < 0.2;
  const isDanger = pct < 0.1;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-semibold
        ${isDanger ? 'bg-rose-100 text-rose-600 animate-pulse' : isWarning ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}
    >
      <Clock className="w-4 h-4" />
      <span>{formatTime(remaining)}</span>
    </div>
  );
};
