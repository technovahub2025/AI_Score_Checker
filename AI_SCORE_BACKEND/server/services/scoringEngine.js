const FACTORS = [
  { name: 'Brand Mention Presence', weight: 20 },
  { name: 'Clarity of Message', weight: 25 },
  { name: 'Content Coverage', weight: 20 },
  { name: 'Competitor Visibility Signals', weight: 15 },
  { name: 'Structured Content Quality', weight: 20 }
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const normalizeText = (text) => (text || '').replace(/\s+/g, ' ').trim();

const splitSentences = (text) =>
  normalizeText(text)
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

const tokenize = (text) =>
  normalizeText(text)
    .toLowerCase()
    .match(/[a-z0-9][a-z0-9'-]*/g) || [];

const uniqueWords = (tokens) => new Set(tokens.filter((token) => token.length > 2));

const countMatches = (text, terms) => {
  const lower = text.toLowerCase();
  return terms.reduce((count, term) => count + (lower.includes(term) ? 1 : 0), 0);
};

const scoreBrandMentionPresence = (text) => {
  const tokens = text.match(/\b[A-Z][A-Za-z0-9&.-]{1,}\b/g) || [];
  const brandWords = tokens.filter((token) => {
    const blacklist = ['The', 'This', 'That', 'With', 'From', 'Your', 'About', 'Where', 'When', 'How'];
    return !blacklist.includes(token);
  });
  const entityHints = countMatches(text, ['inc', 'llc', 'corp', 'ltd', 'company', 'brand', 'product', 'platform']);
  const repeatedMentions = new Set(brandWords.map((word) => word.toLowerCase())).size;

  let score = 18;
  score += Math.min(35, repeatedMentions * 12);
  score += Math.min(25, entityHints * 8);
  if (/\b(we|our|us)\b/i.test(text)) score += 10;
  if (brandWords.length >= 2) score += 12;
  if (brandWords.length >= 4) score += 10;

  return clamp(Math.round(score), 0, 100);
};

const scoreClarityOfMessage = (text) => {
  const sentences = splitSentences(text);
  const words = tokenize(text);
  const avgSentenceLength = sentences.length ? words.length / sentences.length : words.length;
  const jargonHits = countMatches(text, [
    'synergy',
    'revolutionary',
    'leverage',
    'best-in-class',
    'holistic',
    'robust',
    'seamless',
    'next-gen',
    'optimize',
    'paradigm'
  ]);
  const directStatements = countMatches(text, ['you', 'we', 'get', 'save', 'build', 'discover', 'see', 'helps']);

  let score = 95;
  if (avgSentenceLength > 24) score -= 20;
  if (avgSentenceLength > 30) score -= 15;
  if (avgSentenceLength < 7) score -= 8;
  if (jargonHits) score -= Math.min(25, jargonHits * 6);
  if (directStatements) score += Math.min(10, directStatements * 2);
  if (sentences.length < 3) score -= 12;
  if (text.length < 160) score -= 8;

  return clamp(Math.round(score), 0, 100);
};

const scoreContentCoverage = (text) => {
  const tokens = tokenize(text);
  const unique = uniqueWords(tokens);
  const coverageBuckets = [
    ['benefit', 'benefits', 'value', 'outcome', 'results', 'why'],
    ['feature', 'features', 'function', 'functions', 'capability', 'capabilities'],
    ['use case', 'use cases', 'example', 'examples', 'scenario', 'scenarios'],
    ['faq', 'question', 'questions', 'answer', 'answers'],
    ['pricing', 'cost', 'plan', 'plans', 'pricing'],
    ['trust', 'security', 'privacy', 'reliability', 'proof'],
    ['cta', 'contact', 'demo', 'start', 'try', 'get started']
  ];
  const bucketHits = coverageBuckets.filter((bucket) => countMatches(text, bucket) > 0).length;
  const diversity = tokens.length ? unique.size / tokens.length : 0;
  const paragraphCount = (text || '').split(/\n{2,}/).filter((chunk) => chunk.trim().length > 0).length;

  let score = 20;
  score += Math.min(35, bucketHits * 10);
  score += Math.min(25, Math.round(diversity * 60));
  score += Math.min(15, Math.max(0, paragraphCount - 1) * 5);
  if (tokens.length > 120) score += 10;
  if (tokens.length > 250) score += 5;

  return clamp(Math.round(score), 0, 100);
};

const scoreCompetitorVisibilitySignals = (text) => {
  const lower = text.toLowerCase();
  const comparatorHits = countMatches(lower, [
    'vs',
    'versus',
    'compared',
    'comparison',
    'alternative',
    'alternatives',
    'better than',
    'different from',
    'differentiator',
    'market',
    'category leader',
    'benchmark',
    'competitor',
    'rival'
  ]);
  const namedBrandSignals = (text.match(/\b[A-Z][A-Za-z0-9&.-]{1,}\b/g) || []).length;
  const marketContext = countMatches(lower, ['industry', 'segment', 'audience', 'positioning', 'share', 'leader', 'top']);

  let score = 10;
  score += Math.min(45, comparatorHits * 12);
  score += Math.min(20, Math.max(0, namedBrandSignals - 1) * 3);
  score += Math.min(25, marketContext * 6);
  if (/\b(?:we|our)\s+(are|offer|deliver)\b/i.test(text)) score += 8;

  return clamp(Math.round(score), 0, 100);
};

const scoreStructuredContentQuality = (text) => {
  const lines = (text || '').split('\n').map((line) => line.trim());
  const bullets = lines.filter((line) => /^[-*]\s+/.test(line)).length;
  const numbered = lines.filter((line) => /^\d+\.\s+/.test(line)).length;
  const headings = lines.filter((line) => /^(#{1,3}\s+|[A-Z][A-Z0-9\s]{5,}$)/.test(line)).length;
  const definitions = lines.filter((line) => /:/.test(line) && line.length < 140).length;
  const paragraphs = text.split(/\n{2,}/).filter((chunk) => chunk.trim().length > 0).length;

  let score = 15;
  score += Math.min(30, bullets * 10);
  score += Math.min(20, numbered * 10);
  score += Math.min(20, headings * 8);
  score += Math.min(10, definitions * 4);
  score += Math.min(15, Math.max(0, paragraphs - 1) * 3);

  if (/\b(key takeaways|what you get|features|benefits)\b/i.test(text)) score += 5;

  return clamp(Math.round(score), 0, 100);
};

const buildExplanation = (breakdown) => {
  const sorted = [...breakdown].sort((a, b) => a.score - b.score);
  const weakest = sorted.slice(0, 2).map((item) => item.factor).join(' and ');
  const strongest = sorted.slice(-2).map((item) => item.factor).join(' and ');

  return `The content is strongest in ${strongest}, which suggests the structure and readability are reasonably clear. The weakest signals are in ${weakest}, so AI systems have less direct evidence of brand identity, competition context, or deeper topical breadth.`;
};

const buildFactorExplanation = (factor, score) => {
  const low = score < 45;
  const moderate = score >= 45 && score < 75;

  const explanationMap = {
    'Brand Mention Presence': low
      ? 'The content does not clearly name a brand or entity often enough for strong visibility signals.'
      : moderate
        ? 'The content mentions an entity, but it could be more explicit and consistent.'
        : 'The content clearly names the brand or entity in a way AI systems can recognize.',
    'Clarity of Message': low
      ? 'The message reads as dense or indirect, which makes the core point harder to extract.'
      : moderate
        ? 'The copy is understandable, but some sentences still need tightening for faster comprehension.'
        : 'The message is direct and concise, which makes it easy to interpret quickly.',
    'Content Coverage': low
      ? 'The content covers only a narrow slice of the topic, so it misses helpful supporting context.'
      : moderate
        ? 'The page covers several angles, but it can still expand into more useful supporting details.'
        : 'The content addresses the topic broadly and gives AI systems more context to work with.',
    'Competitor Visibility Signals': low
      ? 'The copy lacks comparison language or market context, so its positioning is harder to distinguish.'
      : moderate
        ? 'The page hints at differentiation, but it should make its market position clearer.'
        : 'The content gives strong comparison and positioning cues that help it stand out.',
    'Structured Content Quality': low
      ? 'The content is hard to scan because it does not use enough structural cues like headings or lists.'
      : moderate
        ? 'The structure is usable, but more headings, bullets, or definitions would improve readability.'
        : 'The content is well structured, making it easier for AI systems to parse.'
  };

  return explanationMap[factor] || 'This factor has a mixed signal profile and can be improved further.';
};

const buildRecommendation = (factor) => {
  const map = {
    'Brand Mention Presence': {
      title: 'Strengthen brand mentions',
      detail:
        'Add the brand, product, or entity name in the opening paragraph, page title, and at least one subheading so the subject is unmistakable.',
      priority: 'Medium'
    },
    'Clarity of Message': {
      title: 'Shorten and simplify the message',
      detail:
        'Shorten long sentences, remove jargon, and lead with one direct value statement that tells readers exactly what the content offers.',
      priority: 'High'
    },
    'Content Coverage': {
      title: 'Expand topical coverage',
      detail:
        'Expand the page with use cases, benefits, objections, FAQs, and next steps so the content covers the topic from more than one angle.',
      priority: 'High'
    },
    'Competitor Visibility Signals': {
      title: 'Add comparison context',
      detail:
        'Add a comparison section that names alternatives, differentiators, and category context so the content stands out in competitive searches.',
      priority: 'Medium'
    },
    'Structured Content Quality': {
      title: 'Improve page structure',
      detail:
        'Add headings, bullet lists, and definition-style blocks to make the page easier for AI systems and search engines to parse.',
      priority: 'High'
    }
  };

  return {
    factor,
    ...(map[factor] || {
      title: 'Improve this factor',
      detail: 'Improve the content in a targeted way to strengthen this factor.',
      priority: 'Medium'
    })
  };
};

const scoreContent = (text) => {
  const rawText = String(text || '');
  const normalized = normalizeText(rawText);
  if (!normalized) {
    const breakdown = FACTORS.map((factor) => ({
      factor: factor.name,
      score: 0,
      weight: factor.weight,
      explanation: 'No readable text was provided, so this factor could not be evaluated meaningfully.'
    }));

    return {
      totalScore: 0,
      explanation:
        'No readable text was provided, so the content cannot demonstrate AI visibility signals yet. Add extracted copy, a clearer page structure, or text-rich assets so the scoring engine has something to analyze.',
      breakdown,
      recommendations: FACTORS.map((factor) => buildRecommendation(factor.name)).slice(0, 4)
    };
  }

  const breakdown = FACTORS.map((factor) => {
    let score = 0;
    if (factor.name === 'Brand Mention Presence') score = scoreBrandMentionPresence(normalized);
    if (factor.name === 'Clarity of Message') score = scoreClarityOfMessage(normalized);
    if (factor.name === 'Content Coverage') score = scoreContentCoverage(rawText);
    if (factor.name === 'Competitor Visibility Signals') score = scoreCompetitorVisibilitySignals(normalized);
    if (factor.name === 'Structured Content Quality') score = scoreStructuredContentQuality(rawText);

    return {
      factor: factor.name,
      score,
      weight: factor.weight,
      explanation: buildFactorExplanation(factor.name, score)
    };
  });

  const totalScore = Math.round(
    breakdown.reduce((sum, item) => sum + (item.score * item.weight) / 100, 0)
  );

  const recommendations = [...breakdown]
    .sort((a, b) => a.score - b.score)
    .slice(0, 4)
    .map((item) => buildRecommendation(item.factor));

  return {
    totalScore,
    explanation: buildExplanation(breakdown),
    breakdown,
    recommendations
  };
};

module.exports = {
  scoreContent
};
