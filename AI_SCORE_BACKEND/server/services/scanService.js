const cheerio = require('cheerio');

const normalizeWhitespace = (value) => (value || '').replace(/\s+/g, ' ').trim();

const truncateText = (value, maxLength = 50000) => {
  const text = normalizeWhitespace(value);
  return text.length > maxLength ? text.slice(0, maxLength) : text;
};

const extractTextFromUrl = async (inputUrl) => {
  try {
    const response = await fetch(inputUrl, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!response.ok) {
      throw new Error(`Unable to fetch URL. Received status ${response.status}.`);
    }

    const contentType = response.headers.get('content-type') || '';
    const body = await response.text();

    if (contentType.includes('html')) {
      const $ = cheerio.load(body);
      $('script, style, noscript, svg, iframe').remove();
      const text = $('body').text();
      return truncateText(text);
    }

    return truncateText(body);
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    throw error;
  }
};

module.exports = {
  extractTextFromUrl,
  truncateText,
  normalizeWhitespace
};
