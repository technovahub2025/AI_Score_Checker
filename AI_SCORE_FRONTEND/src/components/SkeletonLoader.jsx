import { memo } from 'react';

const SkeletonLoader = () => {
  return (
    <div className="grid w-full gap-6 py-8">
      <div className="animate-pulse rounded-3xl border border-border bg-surface p-6">
        <div className="h-4 w-32 rounded-full bg-[rgba(29,24,48,0.08)]" />
        <div className="mt-4 h-10 w-2/3 rounded-xl bg-[rgba(29,24,48,0.08)]" />
        <div className="mt-3 h-4 w-5/6 rounded-full bg-[rgba(29,24,48,0.08)]" />
        <div className="mt-3 h-4 w-4/5 rounded-full bg-[rgba(29,24,48,0.08)]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-56 animate-pulse rounded-3xl border border-border bg-surface" />
        <div className="h-56 animate-pulse rounded-3xl border border-border bg-surface" />
      </div>
      <div className="h-72 animate-pulse rounded-3xl border border-border bg-surface" />
    </div>
  );
};

export default memo(SkeletonLoader);
