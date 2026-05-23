import { memo } from 'react';

const SkeletonLoader = () => {
  return (
    <div className="grid w-full gap-6 py-8">
      <div className="skeleton-card rounded-3xl border border-border bg-surface p-6">
        <div className="skeleton-line h-4 w-32 rounded-full" />
        <div className="skeleton-line mt-4 h-10 w-2/3 rounded-xl" />
        <div className="skeleton-line mt-3 h-4 w-5/6 rounded-full" />
        <div className="skeleton-line mt-3 h-4 w-4/5 rounded-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="skeleton-card h-56 rounded-3xl border border-border bg-surface" />
        <div className="skeleton-card h-56 rounded-3xl border border-border bg-surface" />
      </div>
      <div className="skeleton-card h-72 rounded-3xl border border-border bg-surface" />
    </div>
  );
};

export default memo(SkeletonLoader);
