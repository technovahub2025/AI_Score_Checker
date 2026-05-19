export const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

export const formatPreview = (value, maxLength = 120) => {
  const text = (value || '').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

export const getScoreTone = (score) => {
  if (score <= 40) return 'danger';
  if (score <= 70) return 'warning';
  return 'success';
};

export const getPriority = (item, breakdown = []) => {
  const factorName = (item || '').split(':')[0].trim();
  const match = breakdown.find((entry) => entry.factor === factorName);

  if (!match) return 'Medium';
  const severity = ((100 - match.score) * match.weight) / 100;
  return severity >= 15 || match.score < 45 ? 'High' : 'Medium';
};

export const sanitizeInput = (value, collapseWhitespace = true) => {
  const text = String(value || '').replace(/[\u0000-\u001F\u007F]/g, '');
  const normalized = collapseWhitespace ? text.replace(/\s+/g, ' ') : text;
  return normalized.trim();
};
