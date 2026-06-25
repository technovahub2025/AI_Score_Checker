const Scan = require('../models/Scan');
const { normalizeInputUrl, validateScanInput, isValidObjectId } = require('../utils/validators');
const { sendError, sendSuccess } = require('../utils/responseHelper');
const { normalizeWhitespace } = require('../services/scanService');
const { scoreContent } = require('../services/scoringEngine');
const { analyzeTechnicalSeo } = require('../services/technicalSeoService');
const { getCachedScanResult, setCachedScanResult, normalizeScanCacheKey } = require('../services/scanCacheService');
const { normalizeUrl } = require('../utils/normalizeUrl');

const createScan = async (req, res, next) => {
  const startedAt = Date.now();

  try {
    const { inputUrl } = req.body;

    console.log('[scan] request received', {
      method: req.method,
      path: req.originalUrl,
      inputUrl
    });

    console.log('[scan] normalizing url');
    let normalizedUrl;
    try {
      normalizedUrl = normalizeUrl(inputUrl);
      console.log('[scan] url normalized', { raw: inputUrl, normalizedUrl });
    } catch (error) {
      console.error('[scan] invalid url', { message: error.message });
      return sendError(res, `Invalid URL: ${error.message}`, 400);
    }

    console.log('[scan] checking recent scans');
    const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
    const recentScans = await Scan.find({
      inputType: 'url',
      status: 'completed',
      createdAt: { $gte: sixtySecondsAgo }
    })
      .sort({ createdAt: -1 })
      .limit(100);

    console.log('[scan] recent scans loaded', { count: recentScans.length });
    for (const scan of recentScans) {
      try {
        const scannedNormalized = normalizeUrl(scan.inputUrl);
        if (scannedNormalized === normalizedUrl) {
          console.log('[scan] returning recent scan', { normalizedUrl });
          return sendSuccess(res, scan, 200);
        }
      } catch (normalizeError) {
        console.log('[scan] skipping un-normalizable scan url', {
          id: scan._id?.toString?.() || String(scan._id || ''),
          message: normalizeError.message
        });
      }
    }

    console.log('[scan] validating cache key');
    const canonicalInputUrl = normalizeInputUrl(normalizedUrl);
    const normalizedInputUrl = normalizeScanCacheKey(canonicalInputUrl);
    const errors = validateScanInput({ inputUrl: normalizedUrl });

    if (errors.length) {
      console.log('[scan] validation failed', { errors });
      return sendError(res, errors.join(' '), 400);
    }

    console.log('[scan] checking cache');
    const cachedResult = getCachedScanResult(normalizedInputUrl);
    if (cachedResult) {
      console.log('[scan] cache hit');
      const cachedScan = await Scan.create({
        inputType: 'url',
        inputUrl: canonicalInputUrl,
        status: 'completed',
        analysisSource: cachedResult.analysisSource || 'backend',
        inputText: cachedResult.inputText || '',
        contentScore: cachedResult.contentScore || 0,
        technicalScore: cachedResult.technicalScore || 0,
        score: cachedResult.score || 0,
        explanation: cachedResult.explanation || '',
        breakdown: cachedResult.breakdown || [],
        technicalSeo: cachedResult.technicalSeo || null,
        analysisCoverage: cachedResult.analysisCoverage || 'full',
        analysisLimited: Boolean(cachedResult.analysisLimited),
        recommendations: cachedResult.recommendations || []
      });

      console.log('[scan] sending cached response', { elapsedMs: Date.now() - startedAt });
      return sendSuccess(res, cachedScan, 201);
    }

    let sourceText = '';
    let technicalSeo = null;

    console.log('[scan] running technical analysis');
    const analysis = await analyzeTechnicalSeo(normalizedUrl);
    console.log('[scan] technical analysis complete');

    sourceText = normalizeWhitespace(analysis.contentText || analysis.visibleText || '');
    technicalSeo = analysis.technicalSeo;

    console.log('[scan] scoring content');
    const result = scoreContent(sourceText);
    const contentScore = result.totalScore;
    const technicalScore = technicalSeo?.score || 0;
    const totalScore = Math.round(contentScore * 0.75 + technicalScore * 0.25);
    const technicalCoverage = technicalSeo?.coverage || 'full';

    console.log('[scan] saving scan');
    const scan = await Scan.create({
      inputType: 'url',
      inputUrl: canonicalInputUrl,
      status: 'completed',
      inputText: sourceText,
      contentScore,
      technicalScore,
      score: totalScore,
      explanation: result.explanation,
      breakdown: result.breakdown,
      technicalSeo,
      analysisCoverage: technicalCoverage,
      analysisLimited: technicalCoverage !== 'full',
      recommendations: result.recommendations,
      analysisSource: 'hybrid'
    });

    setCachedScanResult(normalizedInputUrl, scan.toObject({ depopulate: true, versionKey: false }));

    console.log('[scan] preparing response', { elapsedMs: Date.now() - startedAt });
    return sendSuccess(res, scan, 201);
  } catch (error) {
    console.error('[scan] request failed', {
      message: error.message,
      stack: error.stack
    });

    if (error.statusCode) {
      return sendError(res, error.message, error.statusCode);
    }
    return next(error);
  }
};

const getScanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return sendError(res, 'Invalid scan id.', 400);
    }

    const scan = await Scan.findById(id).lean();
    if (!scan) {
      return sendError(res, 'Scan not found.', 404);
    }

    return sendSuccess(res, scan, 200);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createScan,
  getScanById
};
