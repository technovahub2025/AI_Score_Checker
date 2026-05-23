const DEFAULT_SCAN_CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_SCAN_CACHE_ENTRIES = 100;

const scanCache = new Map();

const toPositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getScanCacheTtl = () =>
  toPositiveInt(process.env.SCAN_CACHE_TTL_MS, DEFAULT_SCAN_CACHE_TTL_MS);

const normalizeScanCacheKey = (inputUrl) => String(inputUrl || '').trim().toLowerCase();

const evictOldestIfNeeded = () => {
  while (scanCache.size > MAX_SCAN_CACHE_ENTRIES) {
    const oldestKey = scanCache.keys().next().value;
    if (!oldestKey) {
      break;
    }
    scanCache.delete(oldestKey);
  }
};

const getCachedScanResult = (inputUrl) => {
  const key = normalizeScanCacheKey(inputUrl);
  if (!key) {
    return null;
  }

  const entry = scanCache.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    scanCache.delete(key);
    return null;
  }

  return entry.value;
};

const setCachedScanResult = (inputUrl, value) => {
  const key = normalizeScanCacheKey(inputUrl);
  if (!key || !value) {
    return;
  }

  scanCache.set(key, {
    value,
    expiresAt: Date.now() + getScanCacheTtl()
  });
  evictOldestIfNeeded();
};

module.exports = {
  getCachedScanResult,
  setCachedScanResult,
  normalizeScanCacheKey
};
