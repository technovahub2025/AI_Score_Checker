import { useEffect, useState } from 'react';

const size = 220;
const strokeWidth = 12;
const radius = (size - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;

const toneMap = {
  danger: '#FF4D4D',
  warning: '#FFB347',
  success: '#4ADE80'
};

const ScoreCircle = ({ score = 0 }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setProgress(score));
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const offset = circumference - (progress / 100) * circumference;
  const tone = score <= 40 ? 'danger' : score <= 70 ? 'warning' : 'success';

  return (
    <div className="score-circle-wrap">
      <svg className="score-circle" viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6C63FF" />
            <stop offset="100%" stopColor="#3ECFCF" />
          </linearGradient>
        </defs>
        <circle className="score-circle-track" cx={size / 2} cy={size / 2} r={radius} />
        <circle
          className="score-circle-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={toneMap[tone]}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <circle
          className="score-circle-accent"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#scoreGradient)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-circle-content">
        <div className={`score-value tone-${tone}`}>{Math.round(progress)}</div>
        <div className="score-label">AI Visibility Score</div>
      </div>
    </div>
  );
};

export default ScoreCircle;
