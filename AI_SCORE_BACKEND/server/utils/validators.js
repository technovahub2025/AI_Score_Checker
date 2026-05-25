const mongoose = require('mongoose');

const isHostnameLike = (value) =>
  /^(?=.{1,253}$)(?:www\.)?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}(?:[/?#].*)?$/i.test(value) ||
  /^(?=.{1,253}$)(?:www\.)?(?:\d{1,3}\.){3}\d{1,3}(?:[/?#].*)?$/.test(value);

const normalizeInputUrl = (value) => {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }

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

const isValidUrl = (value) => {
  return Boolean(normalizeInputUrl(value));
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateScanInput = ({ inputUrl }) => {
  const errors = [];

  const urlValue = normalizeInputUrl(inputUrl);
  if (!urlValue) {
    errors.push('inputUrl is required.');
  } else if (!isValidUrl(urlValue)) {
    errors.push('inputUrl must be a valid URL or domain name.');
  }

  return errors;
};

module.exports = {
  normalizeInputUrl,
  isValidUrl,
  isValidObjectId,
  validateScanInput
};
