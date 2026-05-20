import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import ScoreCircle from '../components/ScoreCircle';
import BreakdownCard from '../components/BreakdownCard';
import RecommendationPanel from '../components/RecommendationPanel';
import TechnicalSeoPanel from '../components/TechnicalSeoPanel';
import ErrorState from '../components/ErrorState';
import { useScans } from '../context/ScansContext';

const ResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getScanByIdRemote, getScanById } = useScans();
  const [scan, setScan] = useState(() => getScanById(id));
  const [loading, setLoading] = useState(!getScanById(id));

  useEffect(() => {
    let active = true;
    const cachedScan = getScanById(id);
    setScan(cachedScan);
    setLoading(!cachedScan);

    getScanByIdRemote(id)
      .then((result) => {
        if (!active) return;
        setScan(result || cachedScan);
      })
      .catch(() => {
        if (!active) return;
        setScan(cachedScan);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [getScanById, getScanByIdRemote, id]);

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
        message="The requested result is missing from local cache and the backend could not return it."
        onBack={() => navigate('/history')}
      />
    );
  }

  return (
    <motion.div className="grid w-full gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="grid gap-6 rounded-[2rem] border border-border bg-surface p-6 shadow-[0_18px_45px_rgba(24,18,44,0.08)] lg:grid-cols-[260px_1fr] lg:p-8">
        <ScoreCircle score={scan.score} />
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.25em] text-accent-purple">Technova Hub report</p>
          <h1 className="mt-3 text-3xl font-bold text-text md:text-4xl">AI visibility score</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-text-muted">{scan.explanation}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-cyan px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(139,92,246,0.24)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Scan Again
            </Link>
            <Link
              to="/history"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-bg-elevated px-5 py-3 text-sm font-semibold text-text transition hover:-translate-y-0.5 hover:border-accent-purple/20"
            >
              <FileText className="h-4 w-4" />
              View History
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-accent-purple">Category breakdown</p>
            <h2 className="mt-2 text-2xl font-bold text-text">What influenced the score</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {(scan.breakdown || []).map((item) => (
            <BreakdownCard key={item.key} item={item} />
          ))}
        </div>
      </section>

      <TechnicalSeoPanel technicalSeo={scan.technicalSeo} inputType={scan.inputType || scan.type?.toLowerCase()} />

      <RecommendationPanel recommendations={scan.recommendations || []} />
    </motion.div>
  );
};

export default ResultsPage;
