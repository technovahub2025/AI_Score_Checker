const ErrorState = ({ title = 'Something went wrong', message, onRetry, onBack }) => {
  return (
    <div className="card error-state">
      <div className="error-icon">!</div>
      <h2>{title}</h2>
      <p className="muted">{message}</p>
      <div className="action-row">
        {onBack ? (
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            Back
          </button>
        ) : null}
        {onRetry ? (
          <button type="button" className="btn btn-primary" onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ErrorState;
