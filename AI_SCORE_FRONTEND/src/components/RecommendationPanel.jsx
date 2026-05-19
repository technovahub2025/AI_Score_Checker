import { getPriority } from '../utils/formatters';

const RecommendationPanel = ({ recommendations = [], breakdown = [] }) => {
  return (
    <section className="card panel">
      <div className="section-heading">
        <h2>Recommendations</h2>
        <p className="muted">Focus first on the lowest-scoring factors.</p>
      </div>
      {recommendations.length ? (
        <ol className="recommendation-list">
          {recommendations.map((item, index) => {
            const priority = getPriority(item, breakdown);
            return (
              <li key={`${item}-${index}`} className="recommendation-item">
                <div className="recommendation-index">{index + 1}</div>
                <div className="recommendation-content">
                  <div className="recommendation-head">
                    <span>{item.replace(/^[^:]+:\s*/, '')}</span>
                    <span className={`priority priority-${priority.toLowerCase()}`}>{priority}</span>
                  </div>
                  <p className="muted">{item.split(':')[0]}</p>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="muted">No recommendations available.</p>
      )}
    </section>
  );
};

export default RecommendationPanel;
