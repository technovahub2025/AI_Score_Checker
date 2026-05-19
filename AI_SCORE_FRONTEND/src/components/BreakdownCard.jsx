const BreakdownCard = ({ item }) => {
  const weighted = Math.round((item.score / 100) * item.weight);

  return (
    <article className="card breakdown-card">
      <div className="breakdown-top">
        <h3>{item.factor}</h3>
        <span className="badge">{weighted}/{item.weight}</span>
      </div>
      <div className="score-bar">
        <div className="score-bar-fill" style={{ width: `${item.score}%` }} />
      </div>
      <p className="muted">
        Raw score: {item.score}/100
      </p>
      <p>{item.explanation}</p>
    </article>
  );
};

export default BreakdownCard;
