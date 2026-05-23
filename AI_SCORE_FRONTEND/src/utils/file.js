export const formatFileSize = (size) => {
  if (!size) return '0 KB';
  const mb = size / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
};

export const fetchUrlText = async (url) => {
  if (!url) return '';

  try {
    const response = await fetch(url, { mode: 'cors' });
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const title = doc.querySelector('title')?.textContent || '';
    const headings = [...doc.querySelectorAll('h1, h2, h3')].map((node) => node.textContent || '').join(' ');
    const paragraphs = [...doc.querySelectorAll('p')].slice(0, 15).map((node) => node.textContent || '').join(' ');
    return `${title}\n${headings}\n${paragraphs}`.trim();
  } catch (error) {
    return '';
  }
};
