import { memo } from 'react';
import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';

const ErrorState = ({ title = 'Something went wrong', message, onRetry, onBack }) => {
  return (
    <div className="mx-auto grid max-w-xl place-items-center rounded-[1.6rem] border border-border bg-surface p-8 text-center shadow-[0_18px_40px_rgba(24,18,44,0.08)]">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-red-500/10 text-red-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="text-2xl font-bold text-text">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-text-muted">{message}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-elevated px-4 py-2 text-sm text-text transition hover:-translate-y-0.5 hover:border-accent-purple/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        ) : null}
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan px-4 py-2 text-sm font-medium text-white shadow-[0_16px_34px_rgba(139,92,246,0.22)] transition hover:-translate-y-0.5"
          >
            <RotateCcw className="h-4 w-4" />
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default memo(ErrorState);
