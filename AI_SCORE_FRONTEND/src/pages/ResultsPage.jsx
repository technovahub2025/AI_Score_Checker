import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getScan } from '../services/api';
import ScoreCircle from '../components/ScoreCircle';
import BreakdownCard from '../components/BreakdownCard';
import RecommendationPanel from '../components/RecommendationPanel';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';

const ResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scan, setScan] = useState(null);

  const loadScan = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getScan(id);
      setScan(result);
    } catch (err) {
      setError(err.message || 'Unable to load results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScan();
  }, [id]);

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadScan} onBack={() => navigate('/scan')} />;
  }

  return (
    <div className="page results-page">
      <section className="results-header card">
        <ScoreCircle score={scan.score || 0} />
        <div className="results-copy">
          <span className="eyebrow">Analysis complete</span>
          <h1>AI visibility report</h1>
          <p className="summary-card">{scan.explanation}</p>
          <div className="action-row">
            <button type="button" className="btn btn-primary" onClick={() => navigate('/scan')}>
              Scan Again
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/history')}>
              View History
            </button>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Breakdown</h2>
          <p className="muted">Each factor is scored independently and weighted into the final result.</p>
        </div>
        <div className="breakdown-grid">
          {(scan.breakdown || []).map((item) => (
            <BreakdownCard key={item.factor} item={item} />
          ))}
        </div>
      </section>

      <RecommendationPanel recommendations={scan.recommendations || []} breakdown={scan.breakdown || []} />
    </div>
  );
};

export default ResultsPage;
