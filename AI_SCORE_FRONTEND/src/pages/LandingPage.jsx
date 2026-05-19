import { useNavigate } from 'react-router-dom';

const features = [
  { title: 'Fast Analysis', text: 'Get an immediate rules-based visibility score in seconds.' },
  { title: 'Actionable Insights', text: 'See exactly which content signals are helping or hurting you.' },
  { title: 'Track Progress', text: 'Save scans and compare results as you improve your content.' }
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page landing-page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">AI Visibility Score Checker</span>
          <h1>See how AI sees your brand</h1>
          <p className="lead">
            Analyze a URL, paste in text, or upload a file to measure how well your content is structured,
            explained, and positioned for AI discovery.
          </p>
          <div className="action-row">
            <button type="button" className="btn btn-primary" onClick={() => navigate('/scan')}>
              Check Your Score
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/history')}>
              View History
            </button>
          </div>
          <p className="trust-line">No account required | Free to use | Instant results</p>
        </div>
        <div className="hero-orb" />
      </section>

      <section className="feature-grid">
        {features.map((feature) => (
          <article className="card feature-card" key={feature.title}>
            <h2>{feature.title}</h2>
            <p className="muted">{feature.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default LandingPage;
