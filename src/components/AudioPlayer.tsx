/**
 * AudioPlayer — HTML5 audio player designed for listening exam sessions.
 * Features: play/pause, progress bar with scrubbing, playback speed, time display.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Gauge } from 'lucide-react';

interface AudioPlayerProps {
  src: string;          // audio URL
  title?: string;       // e.g. "2025年1月 浙江卷"
  onEnded?: () => void;
}

const SPEEDS = [0.75, 1.0, 1.25, 1.5];

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, title, onEnded }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(1); // default 1.0×
  const [loading, setLoading] = useState(true);

  // Sync state when src changes
  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setLoading(true);
  }, [src]);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
    } else {
      a.play().catch(() => {});
    }
  }, [playing]);

  const handleRewind = () => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, a.currentTime - 10);
  };

  const cycleSpeed = () => {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next];
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    setCurrentTime(t);
    if (audioRef.current) audioRef.current.currentTime = t;
  };

  const fmt = (s: number) => {
    if (!isFinite(s)) return '--:--';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
          <Volume2 className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{title ?? '听力音频'}</p>
          <p className="text-xs text-slate-400">高考英语听力</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-1">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.5}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 accent-blue-600 cursor-pointer"
          style={{
            background: `linear-gradient(to right, #2563eb ${progress}%, #e2e8f0 ${progress}%)`,
          }}
        />
        <div className="flex justify-between text-xs text-slate-400 mt-0.5">
          <span>{fmt(currentTime)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 pb-4 flex items-center justify-between">
        {/* Rewind 10s */}
        <button
          onClick={handleRewind}
          title="后退10秒"
          className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          disabled={loading}
          className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 translate-x-0.5" />}
        </button>

        {/* Speed */}
        <button
          onClick={cycleSpeed}
          title="播放速度"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Gauge className="w-3.5 h-3.5" />
          {SPEEDS[speedIdx]}×
        </button>

        {/* Mute */}
        <button
          onClick={() => {
            setMuted((v) => !v);
            if (audioRef.current) audioRef.current.muted = !muted;
          }}
          title={muted ? '取消静音' : '静音'}
          className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); onEnded?.(); }}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => {
          setDuration(audioRef.current?.duration ?? 0);
          setLoading(false);
        }}
        onCanPlay={() => setLoading(false)}
        preload="metadata"
      />
    </div>
  );
};
