const cheerio = require('cheerio');
const dns = require('dns').promises;
const net = require('net');
const { URL } = require('url');
const { normalizeWhitespace } = require('./scanService');
let chromium;

try {
  ({ chromium } = require('playwright'));
} catch (error) {
  chromium = null;
}

const REQUEST_TIMEOUT_MS = 8000;
const ROBOTS_TIMEOUT_MS = 4000;
const SITEMAP_TIMEOUT_MS = 4000;
const RENDER_TIMEOUT_MS = 12000;
const RENDER_IDLE_TIMEOUT_MS = 5000;
const MAX_BODY_BYTES = 1_500_000;
const MAX_REDIRECTS = 5;
const RENDER_VIEWPORT = { width: 1440, height: 1200 };

const PRIVATE_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0']);
let browserPromise = null;
let browserInstance = null;

const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));

const isPrivateIpv4 = (ip) =>
  /^10\./.test(ip) ||
  /^127\./.test(ip) ||
  /^192\.168\./.test(ip) ||
  /^169\.254\./.test(ip) ||
  /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip);

const isPrivateIpv6 = (ip) => {
  const lower = ip.toLowerCase();
  return lower === '::1' || lower.startsWith('fe80:') || lower.startsWith('fc') || lower.startsWith('fd');
};

const isPrivateAddress = (ip) => {
  if (!ip) return true;
  if (net.isIP(ip) === 4) return isPrivateIpv4(ip);
  if (net.isIP(ip) === 6) return isPrivateIpv6(ip);
  return true;
};

const isPublicHttpUrl = async (inputUrl) => {
  const parsed = new URL(String(inputUrl).trim());
  if (parsed.protocol !== 'https:') {
    const error = new Error('Only https URLs are supported.');
    error.statusCode = 400;
    throw error;
  }

  if (parsed.username || parsed.password) {
    const error = new Error('URLs with embedded credentials are not supported.');
    error.statusCode = 400;
    throw error;
  }

  const hostname = parsed.hostname.toLowerCase();
  if (PRIVATE_HOSTNAMES.has(hostname) || hostname.endsWith('.local')) {
    const error = new Error('Private or local URLs are not supported.');
    error.statusCode = 400;
    throw error;
  }

  if (net.isIP(hostname) && isPrivateAddress(hostname)) {
    const error = new Error('Private or local URLs are not supported.');
    error.statusCode = 400;
    throw error;
  }

  const resolved = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!resolved.length || resolved.some((item) => isPrivateAddress(item.address))) {
    const error = new Error('Private or local URLs are not supported.');
    error.statusCode = 400;
    throw error;
  }

  return parsed;
};

const getBrowser = async () => {
  if (!chromium) {
    throw new Error('Browser rendering is unavailable.');
  }

  if (browserInstance) {
    return browserInstance;
  }

  if (!browserPromise) {
    browserPromise = chromium
      .launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      })
      .then((browser) => {
        browserInstance = browser;
        browser.on('disconnected', () => {
          browserInstance = null;
          browserPromise = null;
        });
        return browser;
      })
      .catch((error) => {
        browserPromise = null;
        throw error;
      });
  }

  return browserPromise;
};

const extractRenderedSignals = async (page) => {
  return page.evaluate(() => {
    const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();
    const pickText = (selector) =>
      Array.from(document.querySelectorAll(selector))
        .map((element) => normalize(element.innerText || element.textContent || ''))
        .filter(Boolean);

    const title = normalize(document.title || '');
    const description = normalize(document.querySelector('meta[name="description"]')?.getAttribute('content') || '');
    const headings = pickText('h1, h2, h3');
    const paragraphs = pickText('p, li');
    const bodyText = normalize(document.body?.innerText || document.body?.textContent || '');
    const filteredText = [title ? `Title: ${title}` : '', description ? `Meta description: ${description}` : '']
      .concat(headings.map((text) => `Heading: ${text}`))
      .concat(paragraphs.map((text) => `Text: ${text}`))
      .filter(Boolean)
      .join('\n\n');

    return {
      title,
      description,
      bodyText,
      filteredText,
      headingsCount: headings.length,
      paragraphCount: paragraphs.length
    };
  });
};

const renderPageSnapshot = async (pageUrl) => {
  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: RENDER_VIEWPORT,
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 TechnovaHubAnalyzer/1.0',
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });

  const page = await context.newPage();
  let navigationError = null;

  try {
    try {
      await page.goto(pageUrl, {
        waitUntil: 'domcontentloaded',
        timeout: RENDER_TIMEOUT_MS
      });
    } catch (error) {
      navigationError = error;
    }

    await page.waitForLoadState('networkidle', { timeout: RENDER_IDLE_TIMEOUT_MS }).catch(() => {});
    await page.waitForTimeout(1000).catch(() => {});

    const [html, signals] = await Promise.all([
      page.content().catch(() => ''),
      extractRenderedSignals(page).catch(() => ({
        title: '',
        description: '',
        bodyText: '',
        filteredText: '',
        headingsCount: 0,
        paragraphCount: 0
      }))
    ]);

    if (!html && !signals.filteredText && navigationError) {
      throw navigationError;
    }

    return {
      html,
      finalUrl: page.url() || pageUrl,
      ...signals,
      analysisMode: 'rendered'
    };
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
};

const readResponseBody = async (response, maxBytes = MAX_BODY_BYTES, timeoutMs = REQUEST_TIMEOUT_MS) => {
  if (!response.body) {
    return response.text();
  }

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  const deadline = Date.now() + timeoutMs;

  try {
    while (true) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        await reader.cancel().catch(() => {});
        throw new Error('Request timed out.');
      }

      const { done, value } = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Request timed out.')), remaining);
        reader.read().then(
          (result) => {
            clearTimeout(timer);
            resolve(result);
          },
          (error) => {
            clearTimeout(timer);
            reject(error);
          }
        );
      });

      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Error('Response exceeded the allowed size.');
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    try {
      reader.releaseLock();
    } catch (error) {
      void error;
    }
  }

  return Buffer.concat(chunks).toString('utf8');
};

const fetchWithLimits = async (inputUrl, { timeoutMs = REQUEST_TIMEOUT_MS, maxBytes = MAX_BODY_BYTES, headers } = {}) => {
  let currentUrl = new URL(String(inputUrl).trim());
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error('Request timed out.')), timeoutMs);

  try {
    for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
      currentUrl = await isPublicHttpUrl(currentUrl.toString());
      const response = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          ...headers
        }
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) {
          return {
            response,
            body: '',
            finalUrl: currentUrl.toString()
          };
        }

        currentUrl = new URL(location, currentUrl);
        continue;
      }

      const body = await readResponseBody(response, maxBytes, timeoutMs);
      return {
        response,
        body,
        finalUrl: response.url || currentUrl.toString()
      };
    }

    throw new Error('Too many redirects.');
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 400;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const fetchTextResource = async (resourceUrl, options = {}) => {
  try {
    const result = await fetchWithLimits(resourceUrl, {
      ...options,
      headers: {
        Accept: 'text/plain,application/xml,text/xml,*/*;q=0.2',
        ...(options.headers || {})
      }
    });

    return result;
  } catch (error) {
    return {
      error,
      body: '',
      finalUrl: resourceUrl,
      response: null
    };
  }
};

const extractVisibleText = (html) => {
  if (!html) return '';
  const $ = cheerio.load(html);
  $('script, style, noscript, svg, iframe').remove();
  return normalizeWhitespace($('body').text());
};

const extractRichText = (html) => {
  if (!html) return '';

  const $ = cheerio.load(html);
  $('script, style, noscript, svg, iframe').remove();

  const title = normalizeWhitespace($('title').first().text() || '');
  const description = extractMetaContent($, 'meta[name="description"]');
  const ogDescription = extractMetaContent($, 'meta[property="og:description"]');
  const headings = $('h1, h2, h3')
    .map((_, element) => normalizeWhitespace($(element).text() || ''))
    .get()
    .filter(Boolean);
  const paragraphs = $('p, li')
    .map((_, element) => normalizeWhitespace($(element).text() || ''))
    .get()
    .filter(Boolean)
    .slice(0, 120);
  const buttons = $('button, a')
    .map((_, element) => normalizeWhitespace($(element).text() || ''))
    .get()
    .filter(Boolean)
    .slice(0, 60);
  const altText = $('img[alt]')
    .map((_, element) => normalizeWhitespace($(element).attr('alt') || ''))
    .get()
    .filter(Boolean)
    .slice(0, 40);

  return normalizeWhitespace(
    [
      title ? `Title: ${title}` : '',
      description ? `Meta description: ${description}` : '',
      ogDescription && ogDescription !== description ? `Open Graph description: ${ogDescription}` : '',
      ...headings.map((text) => `Heading: ${text}`),
      ...paragraphs.map((text) => `Text: ${text}`),
      ...buttons.map((text) => `Control: ${text}`),
      ...altText.map((text) => `Image alt: ${text}`)
    ]
      .filter(Boolean)
      .join('\n\n')
  );
};

const extractMetaContent = ($, selector) => normalizeWhitespace($(selector).attr('content') || '');

const scoreRobotsTxt = (robotsResult) => {
  const robotsText = robotsResult.body || '';
  const lower = normalizeWhitespace(robotsText).toLowerCase();
  const responseStatus = robotsResult.response?.status || 0;
  const status = !robotsResult.response
    ? 'blocked'
    : responseStatus === 404
      ? 'missing'
      : responseStatus >= 400
        ? 'blocked'
        : 'found';

  if (!lower) {
    return {
      score: 0,
      explanation:
        status === 'blocked'
          ? 'robots.txt could not be retrieved, so crawl guidance is blocked.'
          : 'robots.txt is missing or empty, so crawl guidance is unknown.',
      evidence: status === 'blocked' ? ['robots.txt blocked or unavailable'] : ['robots.txt missing or empty'],
      hasSitemapDirective: false,
      status
    };
  }

  const hasUserAgent = /user-agent\s*:/i.test(robotsText);
  const hasSitemap = /sitemap\s*:/i.test(robotsText);
  const blocksWholeSite = /user-agent\s*:\s*\*\s*[\s\S]*?disallow\s*:\s*\/\s*(?:$|\n)/i.test(robotsText);

  let score = 25;
  if (hasUserAgent) score += 25;
  if (hasSitemap) score += 35;
  if (!blocksWholeSite) score += 15;

  const evidence = [];
  if (hasUserAgent) evidence.push('User-agent rules found');
  if (hasSitemap) evidence.push('Sitemap directive found');
  if (blocksWholeSite) evidence.push('Potential site-wide crawl blocking detected');

  return {
    score: clamp(score),
    explanation: hasSitemap
      ? 'robots.txt is available and points crawlers toward sitemap discovery.'
      : 'robots.txt is available, but it does not clearly advertise sitemap discovery.',
    evidence,
    hasSitemapDirective: hasSitemap,
    status: blocksWholeSite ? 'invalid' : hasUserAgent ? 'found' : 'missing'
  };
};

const scoreSitemap = async ({ sitemapUrls }) => {
  const tried = [...new Set(sitemapUrls.filter(Boolean))].slice(0, 5);
  if (!tried.length) {
    return {
      score: 0,
      explanation: 'No sitemap location was discovered from robots.txt or common sitemap paths.',
      evidence: [],
      matchedUrl: '',
      status: 'missing'
    };
  }

  let sawResponse = false;
  let sawInvalidResponse = false;
  let sawBlockedResponse = false;
  for (const sitemapUrl of tried) {
    const result = await fetchTextResource(sitemapUrl, { timeoutMs: SITEMAP_TIMEOUT_MS, maxBytes: MAX_BODY_BYTES });
    if (!result.response) {
      continue;
    }
    sawResponse = true;
    const responseStatus = result.response.status;

    const body = normalizeWhitespace(result.body);
    const isXml = /<urlset[\s>]|<sitemapindex[\s>]/i.test(body);
    if (result.response.ok && isXml) {
      return {
        score: 100,
        explanation: 'A valid sitemap was found and can be crawled.',
        evidence: [`Discovered sitemap: ${sitemapUrl}`],
        matchedUrl: sitemapUrl,
        status: 'found'
      };
    }

    if (result.response.ok && body) {
      sawInvalidResponse = true;
      return {
        score: 70,
        explanation: 'A sitemap location responded, but the format was not clearly parseable as XML.',
        evidence: [`Checked sitemap: ${sitemapUrl}`],
        matchedUrl: sitemapUrl,
        status: 'invalid'
      };
    }

    if (responseStatus === 404) {
      sawInvalidResponse = true;
      continue;
    }

    if (responseStatus >= 400) {
      sawBlockedResponse = true;
    }
  }

  return {
    score: sawResponse ? 20 : 0,
    explanation: sawResponse
      ? 'Sitemap locations were attempted, but none returned a usable sitemap response.'
      : 'Sitemap discovery was blocked or unreachable.',
    evidence: tried.map((url) => `Attempted sitemap: ${url}`),
    matchedUrl: '',
    status: sawResponse ? (sawBlockedResponse ? 'blocked' : sawInvalidResponse ? 'invalid' : 'missing') : 'blocked'
  };
};

const scoreCanonical = ($, finalUrl) => {
  const canonicalHref = normalizeWhitespace($('link[rel="canonical"]').attr('href') || '');
  if (!canonicalHref) {
    return {
      score: 0,
      explanation: 'No canonical tag was found in the page HTML.',
      evidence: [],
      canonicalUrl: '',
      status: 'missing'
    };
  }

  let canonicalUrl = canonicalHref;
  try {
    canonicalUrl = new URL(canonicalHref, finalUrl).href;
  } catch (error) {
    void error;
  }

  const sameOrigin = (() => {
    try {
      return new URL(canonicalUrl).origin === new URL(finalUrl).origin;
    } catch (error) {
      return false;
    }
  })();

  const isExactMatch = canonicalUrl === finalUrl;

  if (isExactMatch) {
    return {
      score: 100,
      explanation: 'The canonical tag points to the current URL.',
      evidence: [`Canonical URL: ${canonicalUrl}`],
      canonicalUrl,
      status: 'found'
    };
  }

  return {
    score: sameOrigin ? 75 : 45,
    explanation: sameOrigin
      ? 'A canonical tag exists and stays on the same site, but it does not exactly match the crawled URL.'
      : 'A canonical tag exists, but it points to a different origin.',
    evidence: [`Canonical URL: ${canonicalUrl}`],
    canonicalUrl,
    status: 'invalid'
  };
};

const scoreMetaTags = ($) => {
  const title = normalizeWhitespace($('title').first().text() || '');
  const description = extractMetaContent($, 'meta[name="description"]');
  const ogTitle = extractMetaContent($, 'meta[property="og:title"]');
  const ogDescription = extractMetaContent($, 'meta[property="og:description"]');
  const twitterTitle = extractMetaContent($, 'meta[name="twitter:title"]');
  const twitterDescription = extractMetaContent($, 'meta[name="twitter:description"]');
  const robotsMeta = normalizeWhitespace(
    $('meta[name="robots"]').attr('content') || $('meta[name="googlebot"]').attr('content') || ''
  );

  let score = 10;
  const evidence = [];
  const titlePresent = Boolean(title);
  const descriptionPresent = Boolean(description);

  if (titlePresent) {
    evidence.push(`Title tag: ${title}`);
    if (title.length >= 30 && title.length <= 60) score += 35;
    else score += 20;
  }

  if (descriptionPresent) {
    evidence.push(`Meta description: ${description}`);
    if (description.length >= 70 && description.length <= 160) score += 35;
    else score += 20;
  }

  if (ogTitle || ogDescription || twitterTitle || twitterDescription) {
    score += 15;
    evidence.push('Social preview tags detected');
  }

  if (robotsMeta && !/noindex|nofollow/i.test(robotsMeta)) {
    score += 10;
    evidence.push(`Robots meta: ${robotsMeta}`);
  } else if (/noindex/i.test(robotsMeta)) {
    score -= 15;
    evidence.push(`Robots meta discourages indexing: ${robotsMeta}`);
  }

  const status = !titlePresent && !descriptionPresent ? 'missing' : titlePresent && descriptionPresent ? 'found' : 'invalid';

  return {
    score: clamp(score),
    explanation: titlePresent || descriptionPresent
      ? 'The page includes core metadata that helps search engines and AI systems understand the page.'
      : 'The page is missing obvious metadata such as a title or description.',
    evidence,
    status
  };
};

const scoreSchema = ($) => {
  const scripts = $('script[type="application/ld+json"]');
  const evidence = [];
  let validCount = 0;
  let invalidCount = 0;
  const types = new Set();

  scripts.each((_, element) => {
    const raw = normalizeWhitespace($(element).text() || '');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      validCount += 1;
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        const typeValue = item && item['@type'];
        if (Array.isArray(typeValue)) {
          typeValue.forEach((value) => types.add(String(value)));
        } else if (typeValue) {
          types.add(String(typeValue));
        }
      }
    } catch (error) {
      invalidCount += 1;
      evidence.push('Found invalid JSON-LD');
    }
  });

  if (!validCount) {
    return {
      score: 0,
      explanation: 'No valid schema markup was detected on the page.',
      evidence,
      schemaCount: 0,
      status: invalidCount > 0 ? 'invalid' : 'missing'
    };
  }

  let score = 40 + Math.min(40, validCount * 15) + Math.min(20, types.size * 5);
  evidence.push(`Valid JSON-LD blocks: ${validCount}`);
  if (types.size) {
    evidence.push(`Schema types: ${Array.from(types).join(', ')}`);
  }

  return {
    score: clamp(score),
    explanation: 'The page includes valid schema markup that can help search engines interpret the content.',
    evidence,
    schemaCount: validCount,
    status: invalidCount > 0 ? 'invalid' : 'found'
  };
};

const buildUnavailableTechnicalSeo = ({ finalUrl, reason }) => {
  const blockedChecks = [
    {
      key: 'robots',
      label: 'robots.txt',
      status: 'blocked',
      score: 0,
      weight: 20,
      explanation: 'robots.txt could not be retrieved, so crawl guidance is blocked.',
      evidence: [reason]
    },
    {
      key: 'sitemap',
      label: 'Sitemap',
      status: 'blocked',
      score: 0,
      weight: 20,
      explanation: 'Sitemap discovery could not be completed because the page fetch failed.',
      evidence: [reason]
    },
    {
      key: 'canonical',
      label: 'Canonical',
      status: 'blocked',
      score: 0,
      weight: 20,
      explanation: 'Canonical inspection could not be completed because the page fetch failed.',
      evidence: [reason]
    },
    {
      key: 'metaTags',
      label: 'Meta tags',
      status: 'blocked',
      score: 0,
      weight: 20,
      explanation: 'Meta tag inspection could not be completed because the page fetch failed.',
      evidence: [reason]
    },
    {
      key: 'schema',
      label: 'Schema',
      status: 'blocked',
      score: 0,
      weight: 20,
      explanation: 'Schema inspection could not be completed because the page fetch failed.',
      evidence: [reason]
    }
  ];

  return {
    score: 0,
    checks: blockedChecks,
    evidence: {
      finalUrl: finalUrl || '',
      canonicalUrl: '',
      robotsUrl: '',
      sitemapUrls: [],
      schemaCount: 0,
      analysisMode: 'blocked',
      coverage: 'blocked'
    }
  };
};

const deriveCoverage = ({ analysisMode, checks }) => {
  const checkStatuses = Array.isArray(checks) ? checks.map((check) => check.status) : [];
  const blockedCount = checkStatuses.filter((status) => status === 'blocked').length;

  if (analysisMode === 'blocked' || (checkStatuses.length && blockedCount === checkStatuses.length)) {
    return 'blocked';
  }

  if (analysisMode === 'rendered' && blockedCount === 0) {
    return 'full';
  }

  return 'partial';
};

const analyzeTechnicalSeo = async (pageUrl) => {
  const targetUrl = await isPublicHttpUrl(pageUrl);
  let pageResult;
  let renderedSnapshot = null;
  let renderError = null;

  try {
    renderedSnapshot = await renderPageSnapshot(targetUrl.toString());
  } catch (error) {
    renderError = error;
  }

  if (!renderedSnapshot) {
    try {
      pageResult = await fetchWithLimits(targetUrl.toString(), {
        timeoutMs: REQUEST_TIMEOUT_MS,
        maxBytes: MAX_BODY_BYTES
      });
    } catch (error) {
      const fallback = buildUnavailableTechnicalSeo({
        finalUrl: targetUrl.toString(),
        reason: error.message || renderError?.message || 'Page fetch failed.'
      });

      return {
        contentText: '',
        visibleText: '',
        technicalSeo: fallback
      };
    }
  }

  const finalUrl = renderedSnapshot?.finalUrl || pageResult?.finalUrl || targetUrl.toString();
  const html = renderedSnapshot?.html || pageResult?.body || '';
  const $ = cheerio.load(html || '');
  const richText = extractRichText(html);
  const visibleText = normalizeWhitespace(renderedSnapshot?.bodyText || extractVisibleText(html) || richText);
  const contentText = normalizeWhitespace(
    renderedSnapshot?.filteredText || renderedSnapshot?.bodyText || richText || extractVisibleText(html)
  );

  const origin = new URL(finalUrl).origin;
  const robotsUrl = new URL('/robots.txt', origin).href;
  const robotsResult = await fetchTextResource(robotsUrl, { timeoutMs: ROBOTS_TIMEOUT_MS, maxBytes: 250_000 });
  const robotsText = robotsResult.body || '';

  const sitemapUrls = [];
  const robotsSitemaps = [...(robotsText.match(/^sitemap:\s*(.+)$/gim) || [])]
    .map((line) => line.split(/sitemap:\s*/i)[1])
    .map((value) => normalizeWhitespace(value))
    .filter(Boolean);

  const resolvedRobotsSitemaps = robotsSitemaps
    .map((item) => {
      try {
        return new URL(item, origin).href;
      } catch (error) {
        return '';
      }
    })
    .filter(Boolean);

  sitemapUrls.push(...resolvedRobotsSitemaps);
  sitemapUrls.push(new URL('/sitemap.xml', origin).href);
  sitemapUrls.push(new URL('/sitemap_index.xml', origin).href);
  sitemapUrls.push(new URL('/sitemap-index.xml', origin).href);

  const robots = scoreRobotsTxt(robotsResult);
  const sitemap = await scoreSitemap({ sitemapUrls });
  const canonical = scoreCanonical($, finalUrl);
  const metaTags = scoreMetaTags($);
  const schema = scoreSchema($);

  const checks = [
    {
      key: 'robots',
      label: 'robots.txt',
      status: robots.status,
      score: robots.score,
      weight: 20,
      explanation: robots.explanation,
      evidence: robots.evidence
    },
    {
      key: 'sitemap',
      label: 'Sitemap',
      status: sitemap.status,
      score: sitemap.score,
      weight: 20,
      explanation: sitemap.explanation,
      evidence: sitemap.evidence
    },
    {
      key: 'canonical',
      label: 'Canonical',
      status: canonical.status,
      score: canonical.score,
      weight: 20,
      explanation: canonical.explanation,
      evidence: canonical.evidence
    },
    {
      key: 'metaTags',
      label: 'Meta tags',
      status: metaTags.status,
      score: metaTags.score,
      weight: 20,
      explanation: metaTags.explanation,
      evidence: metaTags.evidence
    },
    {
      key: 'schema',
      label: 'Schema',
      status: schema.status,
      score: schema.score,
      weight: 20,
      explanation: schema.explanation,
      evidence: schema.evidence
    }
  ];

  const score = clamp(checks.reduce((sum, item) => sum + (item.score * item.weight) / 100, 0));
  const coverage = deriveCoverage({
    analysisMode: renderedSnapshot?.analysisMode || 'raw',
    checks
  });
  const limited = coverage !== 'full';

  return {
    contentText,
    visibleText,
    technicalSeo: {
      score,
      coverage,
      limited,
      checks,
      evidence: {
        finalUrl,
        canonicalUrl: canonical.canonicalUrl || '',
        robotsUrl,
        sitemapUrls: [...new Set(sitemapUrls)],
        schemaCount: schema.schemaCount || 0,
        analysisMode: renderedSnapshot?.analysisMode || 'raw',
        coverage,
        limited,
        title: renderedSnapshot?.title || '',
        description: renderedSnapshot?.description || '',
        contentLength: contentText.length
      }
    }
  };
};

module.exports = {
  analyzeTechnicalSeo,
  isPublicHttpUrl
};
