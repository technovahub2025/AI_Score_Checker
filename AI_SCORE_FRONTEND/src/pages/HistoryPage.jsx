import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory } from '../services/api';
import HistoryItem from '../components/HistoryItem';
import ErrorState from '../components/ErrorState';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({ scans: [], total: 0, page: 1, limit: 10 });

  const loadHistory = async (page = data.page) => {
    try {
      setLoading(true);
      setError('');
      const result = await getHistory({ page, limit: data.limit });
      setData(result);
    } catch (err) {
      setError(err.message || 'Unable to load history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(1);
  }, []);

  if (loading) {
    return (
      <div className="page centered-state">
        <div className="spinner" />
        <h2>Loading history...</h2>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => loadHistory(1)} onBack={() => navigate('/')} />;
  }

  const totalPages = Math.max(Math.ceil(data.total / data.limit), 1);

  return (
    <div className="page history-page">
      <div className="section-heading">
        <h1>Scan History</h1>
        <p className="muted">Review past scans and compare progress over time.</p>
      </div>

      {data.scans.length ? (
        <div className="history-list">
          {data.scans.map((scan) => (
            <HistoryItem key={scan._id} scan={scan} />
          ))}
        </div>
      ) : (
        <div className="card empty-state">
          <div className="empty-icon">0</div>
          <h2>No scans yet. Start your first scan.</h2>
          <p className="muted">Use a URL, paste text, or upload a PDF to generate your first report.</p>
        </div>
      )}

      {data.scans.length ? (
        <div className="pagination">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => loadHistory(Math.max(data.page - 1, 1))}
            disabled={data.page <= 1}
          >
            Previous
          </button>
          <span className="muted">
            Page {data.page} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => loadHistory(Math.min(data.page + 1, totalPages))}
            disabled={data.page >= totalPages}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default HistoryPage;
