const FACTORS = [
  { key: 'structure', label: 'Structure', weight: 20 },
  { key: 'clarity', label: 'Clarity', weight: 25 },
  { key: 'keywords', label: 'Keywords', weight: 20 },
  { key: 'authority', label: 'Authority', weight: 20 },
  { key: 'freshness', label: 'Freshness', weight: 15 }
];

const normalize = (value) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim();

const splitSentences = (text) =>
  normalize(text)
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

const tokenize = (text) =>
  normalize(text)
    .toLowerCase()
    .match(/[a-z0-9][a-z0-9'-]*/g) || [];

const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));

const scoreStructure = (text) => {
  const lines = String(text || '').split('\n').map((line) => line.trim());
  const headings = lines.filter((line) => /^(#{1,3}\s+|[A-Z][A-Z0-9\s]{4,}$)/.test(line)).length;
  const bullets = lines.filter((line) => /^[-*]\s+/.test(line)).length;
  const numbered = lines.filter((line) => /^\d+\.\s+/.test(line)).length;
  const paragraphs = String(text || '').split(/\n{2,}/).filter((chunk) => chunk.trim()).length;

  return clamp(18 + headings * 12 + bullets * 10 + numbered * 10 + paragraphs * 6);
};

const scoreClarity = (text) => {
  const sentences = splitSentences(text);
  const words = tokenize(text);
  const avgLength = sentences.length ? words.length / sentences.length : words.length;
  const jargon = ['synergy', 'robust', 'leverage', 'holistic', 'paradigm', 'seamless', 'optimize'];
  const jargonHits = jargon.reduce((count, term) => count + (normalize(text).toLowerCase().includes(term) ? 1 : 0), 0);

  let score = 90;
  if (avgLength > 24) score -= 18;
  if (avgLength > 32) score -= 10;
  if (avgLength < 8) score -= 6;
  score -= jargonHits * 7;
  if (sentences.length < 3) score -= 12;
  if (normalize(text).length < 150) score -= 10;
  return clamp(score);
};

const scoreKeywords = (text) => {
  const words = tokenize(text).filter((word) => word.length > 3);
  const unique = new Set(words);
  const repetition = words.length ? unique.size / words.length : 0;
  const topicalSignals = ['brand', 'product', 'service', 'website', 'content', 'search', 'ai', 'visibility'];
  const topicalHits = topicalSignals.reduce(
    (count, term) => count + (normalize(text).toLowerCase().includes(term) ? 1 : 0),
    0
  );

  return clamp(15 + topicalHits * 10 + Math.round(repetition * 60));
};

const scoreAuthority = (text) => {
  const lower = normalize(text).toLowerCase();
  const numericEvidence = (lower.match(/\b\d+(\.\d+)?%?\b/g) || []).length;
  const trustSignals = ['case study', 'expert', 'client', 'research', 'data', 'proof', 'testimonial', 'source'];
  const trustHits = trustSignals.reduce((count, term) => count + (lower.includes(term) ? 1 : 0), 0);
  const citations = (lower.match(/\[[0-9]+\]|\(https?:\/\/|https?:\/\/|www\./g) || []).length;

  return clamp(16 + numericEvidence * 6 + trustHits * 8 + citations * 10);
};

const scoreFreshness = (text) => {
  const lower = normalize(text).toLowerCase();
  const yearMatches = (lower.match(/\b(202[0-9]|2030)\b/g) || []).length;
  const freshnessSignals = ['updated', 'latest', 'new', 'recent', 'current', '2025', '2026'];
  const signalHits = freshnessSignals.reduce((count, term) => count + (lower.includes(term) ? 1 : 0), 0);

  return clamp(20 + yearMatches * 12 + signalHits * 8);
};

const buildExplanation = (breakdown, score) => {
  const sorted = [...breakdown].sort((a, b) => a.score - b.score);
  const weak = sorted.slice(0, 2).map((item) => item.label.toLowerCase()).join(' and ');
  const strong = sorted.slice(-2).map((item) => item.label.toLowerCase()).join(' and ');

  return `This content scores ${score}/100 because ${strong} are stronger than ${weak}. Tightening the weakest signals will make the page easier for AI systems to interpret and rank.`;
};

const buildRecommendations = (breakdown) =>
  [...breakdown]
    .sort((a, b) => a.score - b.score)
    .slice(0, 4)
    .map((item) => {
      const copy = {
        structure: {
          title: 'Add clearer content blocks',
          detail: 'Use headings, bullets, and short sections so the page is easier to parse quickly.',
          priority: 'High'
        },
        clarity: {
          title: 'Shorten and simplify sentences',
          detail: 'Lead with direct statements and remove jargon that obscures the main point.',
          priority: 'High'
        },
        keywords: {
          title: 'Reinforce core keywords',
          detail: 'Repeat the primary topic naturally in headings, intro copy, and supporting sections.',
          priority: 'Medium'
        },
        authority: {
          title: 'Add trust signals',
          detail: 'Include numbers, proof points, citations, testimonials, or sources to build authority.',
          priority: 'Medium'
        },
        freshness: {
          title: 'Signal recency',
          detail: 'Add updated timestamps, current references, or recent examples to show freshness.',
          priority: 'Medium'
        }
      }[item.key];

      return {
        factor: item.label,
        ...copy
      };
    });

export const scoreContent = (text) => {
  const source = normalize(text);
  const breakdown = FACTORS.map((factor) => {
    const scoreByFactor = {
      structure: scoreStructure,
      clarity: scoreClarity,
      keywords: scoreKeywords,
      authority: scoreAuthority,
      freshness: scoreFreshness
    };
    const score = scoreByFactor[factor.key](source);

    return {
      key: factor.key,
      label: factor.label,
      score,
      weight: factor.weight,
      explanation:
        {
          structure: 'The layout and formatting cues help AI systems scan this page.',
          clarity: 'The writing is relatively easy to understand and extract.',
          keywords: 'The page includes relevant topic language, but it can be more focused.',
          authority: 'The content has some evidence signals, but more proof would improve trust.',
          freshness: 'The content shows limited recency signals and could feel more current.'
        }[factor.key]
    };
  });

  const totalScore = clamp(
    breakdown.reduce((sum, item) => sum + (item.score * item.weight) / 100, 0)
  );

  return {
    totalScore,
    explanation: buildExplanation(breakdown, totalScore),
    breakdown,
    recommendations: buildRecommendations(breakdown)
  };
};
