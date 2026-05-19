const mongoose = require('mongoose');

const isValidUrl = (value) => {
  try {
    const url = new URL(String(value).trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateScanInput = ({ inputType, inputUrl, inputText }) => {
  const errors = [];

  if (!inputType || !['url', 'text'].includes(inputType)) {
    errors.push('inputType must be either "url" or "text".');
  }

  if (inputType === 'url') {
    const urlValue = String(inputUrl || '').trim();
    if (!urlValue) {
      errors.push('inputUrl is required when inputType is "url".');
    } else if (!isValidUrl(urlValue)) {
      errors.push('inputUrl must be a valid http or https URL.');
    }
  }

  if (inputType === 'text') {
    const value = (inputText || '').trim();
    if (value.length < 50) {
      errors.push('inputText must contain at least 50 characters.');
    }
  }

  return errors;
};

module.exports = {
  isValidUrl,
  isValidObjectId,
  validateScanInput
};
