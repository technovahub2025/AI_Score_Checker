const normalizeUrl = (input) => {
  // Trim whitespace and remove surrounding quotes
  let url = String(input || '').trim().replace(/^["']|["']$/g, '');

  // Strip markdown link format like [text](url) and extract the URL
  const markdownMatch = url.match(/\[[^\]]*]\(([^)]+)\)/);
  if (markdownMatch) {
    url = markdownMatch[1];
  }

  // Add https:// if no protocol is present
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  // Parse and validate using URL constructor
  let parsed;
  try {
    parsed = new URL(url);
  } catch (error) {
    throw new Error(`Invalid URL: ${error.message}`);
  }

  // Strip www. from hostname so www.x.com and x.com are treated identically
  let hostname = parsed.hostname.replace(/^www\./, '');
  
  // Ensure the pathname is at least / (not empty)
  const pathname = parsed.pathname || '/';

  // Reconstruct URL with normalized hostname and pathname
  parsed.hostname = hostname;
  parsed.pathname = pathname;

  // Return the normalized href string
  return parsed.href;
};

module.exports = { normalizeUrl };