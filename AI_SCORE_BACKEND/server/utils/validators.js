const mongoose = require('mongoose');
const { normalizeUrl } = require('./normalizeUrl');

const normalizeInputUrl = (value) => {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }

  try {
    const normalized = normalizeUrl(text);
    if (!/^https?:\/\//i.test(normalized)) {
      return '';
    }
    return normalized;
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