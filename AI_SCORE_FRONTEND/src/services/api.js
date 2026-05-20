import { scoreContent } from '../utils/scoring';
import { fetchUrlText, readFileSummary } from '../utils/file';

const STORAGE_KEY = 'grand-helm.scans';
const CACHE_LIMIT = 100;
const REQUEST_TIMEOUT_MS = 12000;
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === 'localhost' && window.location.port === '5173'
    ? 'http://localhost:5000'
    : window.location.origin);

const readScans = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (error) {
    return [];
  }
};

const writeScans = (scans) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scans.slice(0, CACHE_LIMIT)));
};

const cacheScan = (scan) => {
  const scans = readScans();
  const next = [scan, ...scans.filter((item) => item.id !== scan.id)];
  writeScans(next);
  return scan;
};

const cacheScans = (scans) => {
  const next = [...scans, ...readScans().filter((item) => !scans.some((scan) => scan.id === item.id))];
  writeScans(next);
  return next;
};

const buildUrl = (path) => `${API_BASE_URL}${path}`;

const requestJson = async (path, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(buildUrl(path), {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.headers || {})
      }
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.success) {
      throw new Error(payload?.message || 'Request failed.');
    }

    return payload.data;
  } finally {
    clearTimeout(timeout);
  }
};

const weightedTotalScore = (contentScore, technicalScore) => {
  if (typeof technicalScore !== 'number' || Number.isNaN(technicalScore)) {
    return contentScore;
  }

  return Math.round(contentScore * 0.75 + technicalScore * 0.25);
};

const normalizeScan = (scan, { mode, input, file, sourceText, analysisSource, technicalSeo } = {}) => {
  if (!scan) {
    return null;
  }

  const inputType = scan.inputType || mode || 'text';
  const type = inputType === 'url' ? 'URL' : inputType === 'file' ? 'File' : 'Text';
  const value =
    scan.inputUrl ||
    scan.value ||
    (inputType === 'file' ? scan.fileName || file?.name || scan.fileUrl || 'Uploaded file' : input || '');
  const fileLabel =
    scan.fileLabel ||
    (inputType === 'file'
      ? `${scan.fileName || file?.name || 'Uploaded file'} (${scan.fileType || file?.type || 'file'})`
      : '');
  const contentScore =
    typeof scan.contentScore === 'number' ? scan.contentScore : typeof scan.score === 'number' ? scan.score : 0;
  const technicalScore = typeof scan.technicalScore === 'number' ? scan.technicalScore : 0;
  const score = typeof scan.score === 'number' ? scan.score : contentScore;

  return {
    id: scan.id || scan._id || crypto.randomUUID(),
    inputType,
    inputUrl: scan.inputUrl || '',
    inputText: scan.inputText || sourceText || '',
    fileName: scan.fileName || '',
    fileType: scan.fileType || file?.type || '',
    fileUrl: scan.fileUrl || '',
    type,
    value,
    fileLabel,
    sourceText: scan.inputText || sourceText || '',
    createdAt: scan.createdAt || new Date().toISOString(),
    contentScore,
    technicalScore,
    score,
    explanation: scan.explanation || '',
    breakdown: scan.breakdown || [],
    technicalSeo: scan.technicalSeo || technicalSeo || null,
    recommendations: scan.recommendations || [],
    analysisSource: scan.analysisSource || analysisSource || 'local'
  };
};

const fetchBackendScan = async ({ inputType, inputUrl, inputText }) => {
  return requestJson('/api/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inputType, inputUrl, inputText })
  });
};

const fetchBackendUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return requestJson('/api/upload', {
    method: 'POST',
    body: formData
  });
};

const buildLocalScan = async ({ mode, input, file }) => {
  const fileText = await readFileSummary(file);
  let sourceText = '';

  if (mode === 'url') {
    const fetched = await fetchUrlText(input);
    sourceText = [input, fetched, fileText].filter(Boolean).join('\n\n');
  } else {
    sourceText = [input, fileText].filter(Boolean).join('\n\n');
  }

  const analysis = scoreContent(sourceText || input);
  return normalizeScan(
    {
      id: crypto.randomUUID(),
      inputType: mode,
      inputUrl: mode === 'url' ? input : undefined,
      inputText: sourceText,
      contentScore: analysis.totalScore,
      technicalScore: 0,
      score: analysis.totalScore,
      explanation: analysis.explanation,
      breakdown: analysis.breakdown,
      recommendations: analysis.recommendations,
      analysisSource: 'local'
    },
    { mode, input, file, sourceText }
  );
};

const fetchRemoteScan = async ({ mode, input, file }) => {
  if (file) {
    const uploadResponse = await fetchBackendUpload(file);
    return normalizeScan(uploadResponse, { mode: 'file', file, analysisSource: 'backend' });
  }

  const payload = mode === 'url' ? { inputType: 'url', inputUrl: input } : { inputType: 'text', inputText: input };
  const response = await fetchBackendScan(payload);
  return normalizeScan(response, { mode, input, analysisSource: mode === 'url' ? 'hybrid' : 'backend' });
};

export const analyzeScan = async ({ mode, input, file }) => {
  try {
    const remoteScan = await fetchRemoteScan({ mode, input, file });
    const normalized = cacheScan(remoteScan);
    return normalized;
  } catch (error) {
    const localScan = await buildLocalScan({ mode, input, file });
    return cacheScan(localScan);
  }
};

export const fetchHistoryPage = async (page = 1, limit = 6) => {
  try {
    const data = await requestJson(`/api/history?page=${page}&limit=${limit}`);
    const scans = Array.isArray(data?.scans) ? data.scans.map((scan) => normalizeScan(scan)) : [];
    cacheScans(scans);
    return {
      scans,
      total: data?.total || 0,
      page: data?.page || page,
      limit: data?.limit || limit,
      hasMore: Boolean(data?.hasMore)
    };
  } catch (error) {
    const scans = readScans();
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const start = (safePage - 1) * safeLimit;

    return {
      scans: scans.slice(start, start + safeLimit),
      total: scans.length,
      page: safePage,
      limit: safeLimit,
      hasMore: start + safeLimit < scans.length
    };
  }
};

export const fetchScanById = async (id) => {
  try {
    const scan = await requestJson(`/api/scan/${id}`);
    const normalized = normalizeScan(scan);
    if (normalized) {
      cacheScan(normalized);
    }
    return normalized;
  } catch (error) {
    return readScans().find((scan) => scan.id === id);
  }
};

export const getScans = () => readScans();

export const getScanById = (id) => readScans().find((scan) => scan.id === id);

export const getScoreTone = (score) => {
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
};
