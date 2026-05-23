import { memo, useEffect, useMemo, useState } from 'react';

const SIZE = 220;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ScoreCircle = ({ score = 0 }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setProgress(score));
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const stroke = useMemo(() => {
    if (score >= 70) return '#22c55e';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  }, [score]);

  const offset = CIRCUMFERENCE - (Math.max(0, Math.min(100, progress)) / 100) * CIRCUMFERENCE;

  return (
    <div className="relative mx-auto grid h-[180px] w-[180px] place-items-center sm:h-[220px] sm:w-[220px]">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full -rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE} fill="none" />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={stroke}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-[1200ms] ease-out"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="url(#gh-gradient)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          opacity="0.5"
          className="transition-[stroke-dashoffset] duration-[1200ms] ease-out"
        />
        <defs>
          <linearGradient id="gh-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-4xl font-bold tracking-tight text-text sm:text-5xl">{Math.round(progress)}</div>
          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-text-muted">AI Visibility Score</p>
        </div>
      </div>
    </div>
  );
};

export default memo(ScoreCircle);
