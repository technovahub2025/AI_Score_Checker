const SkeletonLoader = () => {
  return (
    <div className="skeleton-layout">
      <div className="card skeleton-hero shimmer" />
      <div className="grid-2">
        <div className="card skeleton-box shimmer" />
        <div className="card skeleton-box shimmer" />
      </div>
      <div className="card skeleton-panel shimmer" />
    </div>
  );
};

export default SkeletonLoader;
