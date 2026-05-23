import { memo, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto grid h-[180px] w-[180px] place-items-center sm:h-[220px] sm:w-[220px]"
    >
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0.35, scale: 0.95 }}
        animate={{ opacity: [0.35, 0.6, 0.35], scale: [0.95, 1.03, 0.95] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-6 -z-10 rounded-full bg-gradient-to-r from-accent-purple/20 to-accent-cyan/15 blur-2xl"
      />
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
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.12 }}>
          <div className="text-4xl font-bold tracking-tight text-text sm:text-5xl">{Math.round(progress)}</div>
          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-text-muted">AI Visibility Score</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default memo(ScoreCircle);
