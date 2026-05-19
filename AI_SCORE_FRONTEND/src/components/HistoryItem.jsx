import { Link } from 'react-router-dom';
import { formatDate, formatPreview, getScoreTone } from '../utils/formatters';

const HistoryItem = ({ scan }) => {
  const preview = scan.inputType === 'url' ? scan.inputUrl : scan.fileUrl || scan.inputText;
  const tone = getScoreTone(scan.score || 0);

  return (
    <article className="card history-item">
      <div className="history-main">
        <div className="history-copy">
          <h3>{scan.inputType.toUpperCase()}</h3>
          <p className="muted">{formatPreview(preview, 110) || 'No preview available'}</p>
        </div>
        <div className={`score-pill score-${tone}`}>{scan.score ?? 0}</div>
      </div>
      <div className="history-footer">
        <span className="muted">{formatDate(scan.createdAt)}</span>
        <Link to={`/results/${scan._id}`} className="text-link">
          View Results
        </Link>
      </div>
    </article>
  );
};

export default HistoryItem;
