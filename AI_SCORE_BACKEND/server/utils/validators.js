const mongoose = require('mongoose');

const isValidUrl = (value) => {
  try {
    const url = new URL(String(value).trim());
    return url.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateScanInput = ({ inputUrl }) => {
  const errors = [];

  const urlValue = String(inputUrl || '').trim();
  if (!urlValue) {
    errors.push('inputUrl is required.');
  } else if (!isValidUrl(urlValue)) {
    errors.push('inputUrl must be a valid https URL.');
  }

  return errors;
};

module.exports = {
  isValidUrl,
  isValidObjectId,
  validateScanInput
};
