import { memo } from 'react';
import { motion } from 'framer-motion';
import { hoverLift } from '../utils/motion';

const BreakdownCard = ({ item }) => {
  const label = item.label || item.factor || 'Factor';
  const progress = `${Math.max(0, Math.min(100, item.score))}%`;

  return (
    <motion.article
      {...hoverLift}
      className="glass-panel rounded-[1.5rem] p-5 transition duration-300 will-change-transform hover:shadow-[0_18px_40px_rgba(24,18,44,0.08)]"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-text">{label}</h3>
        <span className="rounded-full bg-accent-purple/10 px-3 py-1 text-xs font-medium text-accent-purple">
          {item.score}/100
        </span>
      </div>
      <div className="h-2 rounded-full bg-[rgba(29,24,48,0.08)]">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-accent-purple to-accent-cyan transition-all duration-700"
          style={{ width: progress }}
        />
      </div>
      <div className="mt-3 text-xs text-text-muted">Weight {item.weight}%</div>
      <p className="mt-3 text-sm leading-6 text-text-muted">{item.explanation}</p>
    </motion.article>
  );
};

export default memo(BreakdownCard);
