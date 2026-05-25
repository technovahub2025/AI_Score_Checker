export const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

export const scoreTone = (score) => {
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
};

export const getScoreTone = scoreTone;

export const sanitizeInput = (value, keepUrlSlashes = false) => {
  const text = String(value || '').replace(/[\u0000-\u001F\u007F]/g, '');
  const normalized = text.replace(/\s+/g, ' ');
  if (keepUrlSlashes) return normalized.trim();
  return normalized.trim();
};

const isHostnameLike = (value) =>
  /^(?=.{1,253}$)(?:www\.)?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}(?:[/?#].*)?$/i.test(value) ||
  /^(?=.{1,253}$)(?:www\.)?(?:\d{1,3}\.){3}\d{1,3}(?:[/?#].*)?$/.test(value);

export const normalizeScanUrl = (value) => {
  const text = sanitizeInput(value, true);
  if (!text) return '';

  if (/^http:\/\//i.test(text)) {
    return '';
  }

  const candidate = /^https:\/\//i.test(text) ? text : `https://${text}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:') {
      return '';
    }

    if (!isHostnameLike(url.hostname)) {
      return '';
    }

    return url.toString();
  } catch (error) {
    void error;
    return '';
  }
};
