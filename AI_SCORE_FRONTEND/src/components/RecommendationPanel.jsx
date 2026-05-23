import { memo } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, Flame, Lightbulb, ShieldAlert } from 'lucide-react';
import { hoverLift, staggerContainer, staggerItem } from '../utils/motion';

const iconMap = {
  High: Flame,
  Medium: Lightbulb
};

const normalizeRecommendation = (item, index) => {
  if (!item) return null;

  if (typeof item === 'string') {
    const [factor, ...rest] = item.split(':');
    return {
      factor: factor.trim(),
      title: factor.trim(),
      detail: rest.join(':').trim() || item,
      priority: 'Medium'
    };
  }

  if (typeof item === 'object') {
    return {
      factor: item.factor || `Recommendation ${index + 1}`,
      title: item.title || item.factor || `Recommendation ${index + 1}`,
      detail: item.detail || item.explanation || '',
      priority: item.priority || 'Medium'
    };
  }

  return null;
};

const RecommendationPanel = ({ recommendations = [] }) => {
  const normalizedRecommendations = recommendations
    .map((item, index) => normalizeRecommendation(item, index))
    .filter(Boolean);

  return (
    <section className="glass-panel rounded-[1.8rem] p-6">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Next steps</p>
        <h2 className="mt-2 text-2xl font-bold text-text">Recommendations</h2>
      </div>
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} className="grid gap-3">
        {normalizedRecommendations.map((item, index) => {
          const Icon = item.priority === 'High' ? ShieldAlert : iconMap[item.priority] || BadgeCheck;
          return (
            <motion.div
              key={`${item.factor}-${index}`}
              variants={staggerItem}
              {...hoverLift}
              className="flex gap-4 rounded-[1.4rem] border border-border bg-bg-elevated p-4 will-change-transform"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-purple/15 to-accent-cyan/15 text-accent-purple">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-text">{item.title}</p>
                  <span className="rounded-full bg-accent-purple/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-accent-purple">
                    {item.priority}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-text-muted">{item.detail}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default memo(RecommendationPanel);
