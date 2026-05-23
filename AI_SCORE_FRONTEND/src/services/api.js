import axios from 'axios';
import { scoreContent } from '../utils/scoring';
import { fetchUrlText } from '../utils/file';

const REQUEST_TIMEOUT_MS = 12000;
const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isLocalHost ? 'http://localhost:5000' : window.location.origin);
const LOCAL_SCAN_CACHE_KEY = 'grand-helm.local-scans';

const readLocalScanCache = () => {
  try {
    const raw = window.localStorage.getItem(LOCAL_SCAN_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    void error;
    return {};
  }
};

const writeLocalScanCache = (scan) => {
  if (!scan?.id) return;

  try {
    const cache = readLocalScanCache();
    cache[scan.id] = scan;
    window.localStorage.setItem(LOCAL_SCAN_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    void error;
  }
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: 'application/json'
  }
});

const isMongoObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value || ''));

const recommendationPresets = {
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

const normalizeRecommendation = (item, index, breakdown = []) => {
  if (!item) return null;

  if (typeof item === 'object') {
    if (item.title || item.detail || item.priority) {
      return {
        factor: item.factor || breakdown[index]?.factor || `Recommendation ${index + 1}`,
        title: item.title || recommendationPresets[item.factor]?.title || `Recommendation ${index + 1}`,
        detail: item.detail || recommendationPresets[item.factor]?.detail || '',
        priority: item.priority || recommendationPresets[item.factor]?.priority || 'Medium'
      };
    }
  }

  const raw = String(item);
  const [rawFactor, ...rest] = raw.split(':');
  const factor = rawFactor.trim();
  const preset = recommendationPresets[factor] || {};
  return {
    factor,
    title: preset.title || factor || `Recommendation ${index + 1}`,
    detail: rest.join(':').trim() || preset.detail || raw,
    priority: preset.priority || 'Medium'
  };
};

const normalizeRecommendations = (recommendations, breakdown = []) =>
  (Array.isArray(recommendations) ? recommendations : [])
    .map((item, index) => normalizeRecommendation(item, index, breakdown))
    .filter(Boolean)
    .slice(0, 4);

const requestJson = async (path, options = {}) => {
  try {
    const response = await apiClient.request({
      url: path,
      method: options.method || 'get',
      data: options.body,
      headers: options.headers,
      timeout: options.timeoutMs || REQUEST_TIMEOUT_MS
    });

    const payload = response.data;
    if (!payload?.success) {
      throw new Error(payload?.message || 'Request failed.');
    }

    return payload.data;
  } catch (error) {
    const message = error?.response?.data?.message || error.message || 'Request failed.';
    throw new Error(message);
  }
};

const normalizeScan = (scan, { input, sourceText, analysisSource, technicalSeo } = {}) => {
  if (!scan) {
    return null;
  }

  const inputType = 'url';
  const type = 'URL';
  const value = scan.inputUrl || scan.value || input || '';
  const contentScore = typeof scan.contentScore === 'number' ? scan.contentScore : typeof scan.score === 'number' ? scan.score : 0;
  const technicalScore = typeof scan.technicalScore === 'number' ? scan.technicalScore : 0;
  const score = typeof scan.score === 'number' ? scan.score : contentScore;

  return {
    id: scan.id || scan._id || crypto.randomUUID(),
    inputType,
    inputUrl: scan.inputUrl || '',
    type,
    value,
    sourceText: scan.inputText || sourceText || '',
    createdAt: scan.createdAt || new Date().toISOString(),
    contentScore,
    technicalScore,
    score,
    explanation: scan.explanation || '',
    breakdown: scan.breakdown || [],
    technicalSeo: scan.technicalSeo || technicalSeo || null,
    analysisCoverage: scan.analysisCoverage || technicalSeo?.evidence?.coverage || 'partial',
    analysisLimited: Boolean(scan.analysisLimited ?? technicalSeo?.evidence?.limited ?? false),
    recommendations: normalizeRecommendations(scan.recommendations, scan.breakdown || []),
    analysisSource: scan.analysisSource || analysisSource || 'local'
  };
};

const fetchBackendScan = async ({ inputUrl }) => {
  return requestJson('/api/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: { inputType: 'url', inputUrl }
  });
};

const buildLocalScan = async ({ input }) => {
  const fetched = await fetchUrlText(input);
  const sourceText = fetched || '';

  const analysis = scoreContent(sourceText);
  return normalizeScan(
    {
      id: crypto.randomUUID(),
      inputType: 'url',
      inputUrl: input,
      inputText: sourceText,
      contentScore: analysis.totalScore,
      technicalScore: 0,
      score: analysis.totalScore,
      explanation: analysis.explanation,
      breakdown: analysis.breakdown,
      recommendations: normalizeRecommendations(analysis.recommendations, analysis.breakdown),
      analysisSource: 'local'
    },
    { input, sourceText }
  );
};

const fetchRemoteScan = async ({ input }) => {
  const response = await fetchBackendScan({ inputUrl: input });
  return normalizeScan(response, { input, analysisSource: 'backend' });
};

export const analyzeScan = async ({ input }) => {
  try {
    const remoteScan = await fetchRemoteScan({ input });
    return remoteScan;
  } catch (error) {
    const localScan = await buildLocalScan({ input });
    writeLocalScanCache(localScan);
    return localScan;
  }
};

export const fetchScanById = async (id) => {
  const cachedScan = readLocalScanCache()[id];
  if (cachedScan) {
    return normalizeScan(cachedScan);
  }

  if (!isMongoObjectId(id)) {
    throw new Error('Scan not found.');
  }

  try {
    const scan = await requestJson(`/api/scan/${id}`);
    return normalizeScan(scan);
  } catch (error) {
    throw error;
  }
};

export const getScoreTone = (score) => {
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
};
