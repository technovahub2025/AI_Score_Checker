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
