export const formatFileSize = (size) => {
  if (!size) return '0 KB';
  const mb = size / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
};

export const extractPdfText = async (file) => {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
  GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
  const buffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: buffer }).promise;
  let text = '';

  for (let page = 1; page <= pdf.numPages; page += 1) {
    const pageData = await pdf.getPage(page);
    const content = await pageData.getTextContent();
    text += content.items.map((item) => item.str).join(' ') + '\n';
  }

  return text.trim();
};

export const readFileSummary = async (file) => {
  if (!file) return '';
  if (file.type === 'application/pdf') return extractPdfText(file);
  return `${file.name} ${file.type || ''}`.trim();
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
