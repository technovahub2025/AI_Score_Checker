import { memo } from 'react';
import { motion } from 'framer-motion';
import { Globe2, Link2, MapPinned, ShieldCheck, FileCode2 } from 'lucide-react';
import { hoverLift, staggerContainer, staggerItem } from '../utils/motion';

const iconMap = {
  robots: ShieldCheck,
  sitemap: MapPinned,
  canonical: Link2,
  metaTags: Globe2,
  schema: FileCode2
};

const toneStyles = {
  green: 'bg-emerald-500/10 text-emerald-700',
  yellow: 'bg-amber-500/10 text-amber-700',
  red: 'bg-red-500/10 text-red-700'
};

const statusStyles = {
  found: 'bg-emerald-500/10 text-emerald-700',
  missing: 'bg-red-500/10 text-red-700',
  invalid: 'bg-amber-500/10 text-amber-700',
  blocked: 'bg-slate-500/10 text-slate-700 dark:text-slate-200'
};

const coverageStyles = {
  full: 'bg-emerald-500/10 text-emerald-700',
  partial: 'bg-amber-500/10 text-amber-700',
  blocked: 'bg-slate-500/10 text-slate-700 dark:text-slate-200'
};

const getTone = (score) => {
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
};

const formatStatus = (status) => String(status || '').replace(/^[a-z]/, (char) => char.toUpperCase());

const legendItems = [
  { key: 'found', label: 'Found', className: 'bg-emerald-500' },
  { key: 'missing', label: 'Missing', className: 'bg-red-500' },
  { key: 'invalid', label: 'Invalid', className: 'bg-amber-500' },
  { key: 'blocked', label: 'Blocked', className: 'bg-slate-500' }
];

const TechnicalSeoPanel = ({ technicalSeo, inputType }) => {
  if (inputType !== 'url') {
    return null;
  }

  if (!technicalSeo?.checks?.length) {
    return (
      <section className="glass-panel rounded-[1.8rem] p-6">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Technical SEO</p>
          <h2 className="mt-2 text-2xl font-bold text-text">URL checks</h2>
        </div>
        <p className="text-sm leading-7 text-text-muted">
          Technical SEO details were not available for this scan, but the score still reflects the visible content
          analysis.
        </p>
      </section>
    );
  }

  const tone = getTone(technicalSeo.score);
  const analysisMode = technicalSeo?.evidence?.analysisMode;
  const coverage = technicalSeo?.coverage || technicalSeo?.evidence?.coverage || 'partial';
  const limited = Boolean(technicalSeo?.limited || technicalSeo?.evidence?.limited || coverage !== 'full');
  const coverageLabel = coverage === 'full' ? 'Full coverage' : coverage === 'blocked' ? 'Blocked coverage' : 'Partial coverage';

  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.14 }}
      className="glass-panel rounded-[1.8rem] p-6"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-text-muted">Technical SEO</p>
          <h2 className="mt-2 text-2xl font-bold text-text">URL checks</h2>
          <p className="mt-2 text-sm leading-7 text-text-muted">
            Crawlability and metadata checks that help explain the score.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${coverageStyles[coverage] || coverageStyles.partial}`}>
            {coverageLabel}
          </span>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${toneStyles[tone]}`}>
            {technicalSeo.score}/100
          </span>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-border bg-bg-elevated px-4 py-3 text-xs font-medium text-text-muted sm:flex-row sm:flex-wrap sm:items-center">
        <span className="uppercase tracking-[0.18em]">Status legend</span>
        <div className="flex flex-wrap items-center gap-3">
          {legendItems.map((item) => (
            <span key={item.key} className="inline-flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${item.className}`} />
              <span>{item.label}</span>
            </span>
          ))}
        </div>
        {analysisMode ? (
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted sm:ml-auto">
            {analysisMode === 'rendered' ? 'Rendered analysis' : analysisMode}
          </span>
        ) : null}
      </div>

      {limited ? (
        <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          This score is limited because some technical checks were not fully reachable.
        </div>
      ) : null}

      <motion.div variants={staggerContainer} className="grid gap-3 md:grid-cols-2">
        {technicalSeo.checks.map((check) => {
          const Icon = iconMap[check.key] || ShieldCheck;
          const checkTone = getTone(check.score);

          return (
            <motion.article
              key={check.key}
              variants={staggerItem}
              {...hoverLift}
              className="rounded-[1.4rem] border border-border bg-bg-elevated p-4 transition duration-300 will-change-transform"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent-purple/10 text-accent-purple">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-text">{check.label}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${statusStyles[check.status] || statusStyles.invalid}`}>
                        {formatStatus(check.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-text-muted">{check.explanation}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneStyles[checkTone]}`}>
                  {check.score}/100
                </span>
              </div>

              {check.evidence?.length ? (
                <ul className="mt-3 space-y-1 text-xs leading-6 text-text-muted">
                  {check.evidence.slice(0, 3).map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              ) : null}
            </motion.article>
          );
        })}
      </motion.div>
    </motion.section>
  );
};

export default memo(TechnicalSeoPanel);
