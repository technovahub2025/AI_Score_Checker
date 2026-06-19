import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import ScoreCircle from '../components/ScoreCircle';
import BreakdownCard from '../components/BreakdownCard';
import RecommendationPanel from '../components/RecommendationPanel';
import TechnicalSeoPanel from '../components/TechnicalSeoPanel';
import ErrorState from '../components/ErrorState';
import { useScans } from '../context/ScansContext';
import { pageMotion, sectionReveal, staggerContainer, staggerItem } from '../utils/motion';

const ResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getScanByIdRemote } = useScans();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCoverageNotice, setShowCoverageNotice] = useState(false);
  const coverage = scan?.analysisCoverage || scan?.technicalSeo?.evidence?.coverage || 'partial';
  const coverageLabel =
    coverage === 'full'
      ? 'Full coverage'
      : coverage === 'blocked'
        ? 'Blocked coverage'
        : 'Full coverage requires rescan';
  const coverageTone =
    coverage === 'full'
      ? 'bg-emerald-500/10 text-emerald-700'
      : coverage === 'blocked'
        ? 'bg-slate-500/10 text-slate-700 dark:text-slate-200'
        : 'bg-amber-500/10 text-amber-700';
  const limited = Boolean(scan?.analysisLimited || coverage !== 'full');

  useEffect(() => {
    let active = true;
    setScan(null);
    setLoading(true);
    setShowCoverageNotice(false);

    getScanByIdRemote(id)
      .then((result) => {
        if (!active) return;
        setScan(result || null);
      })
      .catch(() => {
        if (!active) return;
        setScan(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [getScanByIdRemote, id]);

  useEffect(() => {
    if (!scan || coverage === 'full') {
      setShowCoverageNotice(false);
      return undefined;
    }

    setShowCoverageNotice(true);
    const timer = window.setTimeout(() => {
      setShowCoverageNotice(false);
    }, 5500);

    return () => window.clearTimeout(timer);
  }, [coverage, scan]);

  if (loading && !scan) {
    return (
      <div className="grid w-full gap-6">
        <section className="grid h-64 animate-pulse gap-6 rounded-[2rem] border border-border bg-surface p-6 shadow-[0_18px_45px_rgba(24,18,44,0.08)]" />
        <section className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-[1.5rem] border border-border bg-surface" />
          ))}
        </section>
      </div>
    );
  }

  if (!scan) {
    return (
      <ErrorState
        title="Scan not found"
        message="The requested result could not be loaded from the backend."
        onBack={() => navigate('/#quick-scan')}
      />
    );
  }

  return (
    <motion.div className="grid w-full gap-6" initial={pageMotion.initial} animate={pageMotion.animate} exit={pageMotion.exit} transition={pageMotion.transition}>
      {showCoverageNotice ? (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.96 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed right-4 top-4 z-50 w-[calc(100vw-2rem)] max-w-md rounded-2xl border border-amber-500/25 bg-[#fff8e8] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)] dark:bg-[#1a160f]"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text">Full coverage requires a rescan</p>
              <p className="mt-1 text-sm leading-6 text-text-muted">
                Some technical checks were only partially reachable. Run the scan again to get full coverage.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCoverageNotice(false)}
              className="rounded-full p-1.5 text-text-muted transition hover:bg-black/5 hover:text-text dark:hover:bg-white/10"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      ) : null}
      <motion.section
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid gap-6 rounded-[2rem] border border-border bg-surface p-6 shadow-[0_18px_45px_rgba(24,18,44,0.08)] lg:grid-cols-[260px_1fr] lg:p-8"
      >
        <ScoreCircle score={scan.score} />
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.25em] text-accent-purple">Technova Hub report</p>
          <h1 className="mt-3 text-3xl font-bold text-text md:text-4xl">AI visibility score</h1>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${coverageTone}`}>
              {coverageLabel}
            </span>
            {limited ? (
              <span className="rounded-full border border-border bg-bg-elevated px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                Coverage limited
              </span>
            ) : null}
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-text-muted">{scan.explanation}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/#quick-scan"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-cyan px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(139,92,246,0.24)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Scan Again
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.section variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} className="grid gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-accent-purple">Category breakdown</p>
            <h2 className="mt-2 text-2xl font-bold text-text">What influenced the score</h2>
          </div>
        </div>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} className="grid gap-4 md:grid-cols-2">
          {(scan.breakdown || []).map((item) => (
            <motion.div key={item.key} variants={staggerItem}>
              <BreakdownCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <motion.div variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }}>
        <TechnicalSeoPanel technicalSeo={scan.technicalSeo} inputType={scan.inputType || scan.type?.toLowerCase()} />
      </motion.div>

      <motion.div variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }}>
        <RecommendationPanel recommendations={scan.recommendations || []} />
      </motion.div>
    </motion.div>
  );
};

export default ResultsPage;
