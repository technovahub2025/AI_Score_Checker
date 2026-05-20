import { useEffect, useState } from 'react';
import { ArrowRight, Compass, FileText, Globe2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScans } from '../context/ScansContext';
import { formatDate, getScoreTone } from '../utils/formatters';

const HISTORY_LIMIT = 200;

const toneStyles = {
  green: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  yellow: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  red: 'bg-red-500/10 text-red-700 border-red-500/20'
};

const getScanIcon = (scan) => (scan.type === 'URL' ? Globe2 : FileText);

const HistoryRow = ({ scan }) => {
  const Icon = getScanIcon(scan);
  const tone = getScoreTone(scan.score);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 border-b border-border px-4 py-3 transition hover:bg-bg-elevated/60 last:border-b-0 md:px-5">
      <div className="flex min-w-0 items-end gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-accent-purple/15 to-accent-cyan/15 text-accent-purple">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-text">{scan.value}</p>
            <span className="rounded-full border border-border bg-surfaceStrong px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-text-muted">
              {scan.type}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-muted">
            <span className="truncate">{formatDate(scan.createdAt)}</span>
            {scan.fileLabel ? <span className="truncate">{scan.fileLabel}</span> : null}
          </div>
        </div>
      </div>

      <div className="flex items-end gap-2 justify-self-end">
        <span className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${toneStyles[tone]}`}>{scan.score}</span>
        <Link
          to={`/results/${scan.id}`}
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-bg-elevated px-3.5 py-2 text-sm font-semibold text-text transition hover:-translate-y-0.5 hover:border-accent-purple/20 hover:shadow-[0_12px_24px_rgba(24,18,44,0.08)]"
        >
          View Results
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

const HistoryPage = () => {
  const { getHistoryPage, refreshToken } = useScans();
  const [history, setHistory] = useState({ scans: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    getHistoryPage(1, HISTORY_LIMIT)
      .then((result) => {
        if (!active) return;
        setHistory({
          scans: result.scans || [],
          total: result.total || 0
        });
      })
      .catch((fetchError) => {
        if (!active) return;
        setError(fetchError.message || 'Unable to load scan history.');
        setHistory({ scans: [], total: 0 });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [getHistoryPage, refreshToken]);

  return (
    <div className="grid w-full gap-6">
      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-accent-purple">Technova Hub</p>
        <h1 className="mt-3 text-3xl font-bold text-text md:text-4xl">Scan History</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">
          Newest scans first in a compact scroll list. No pagination controls, only an inline history feed.
        </p>
      </section>

      <section className="glass-panel overflow-hidden rounded-[2rem]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-bg-elevated/85 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted backdrop-blur-sm md:px-5">
          <div className="pl-8 md:pl-10">Scan</div>
          <div className="pr-6 text-right md:pr-8">Actions</div>
        </div>

        <div className="max-h-[min(68vh,44rem)] overflow-y-auto">
          {loading ? (
            <div className="px-5 py-10 text-sm text-text-muted">Loading history...</div>
          ) : history.scans.length ? (
            <div>
              {history.scans.map((scan) => (
                <HistoryRow key={scan.id} scan={scan} />
              ))}
            </div>
          ) : (
            <div className="grid place-items-center px-6 py-16 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-accent-purple/15 to-accent-cyan/15 text-accent-purple">
                <Compass className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-text">No scans yet. Start your first scan.</h2>
              <p className="mt-2 max-w-md text-sm leading-7 text-text-muted">
                Analyze a URL, paste text, or upload a file to create your first Technova Hub report.
              </p>
              <Link
                to="/scan"
                className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-accent-purple to-accent-cyan px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(139,92,246,0.24)]"
              >
                Start a Scan
              </Link>
            </div>
          )}
        </div>
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
};

export default HistoryPage;
