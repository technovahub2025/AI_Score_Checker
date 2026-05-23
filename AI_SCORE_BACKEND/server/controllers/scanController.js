const Scan = require('../models/Scan');
const { validateScanInput, isValidObjectId } = require('../utils/validators');
const { sendError, sendSuccess } = require('../utils/responseHelper');
const { normalizeWhitespace } = require('../services/scanService');
const { scoreContent } = require('../services/scoringEngine');
const { analyzeTechnicalSeo } = require('../services/technicalSeoService');
const { getCachedScanResult, setCachedScanResult, normalizeScanCacheKey } = require('../services/scanCacheService');

const createScan = async (req, res, next) => {
  try {
    const { inputUrl } = req.body;
    const normalizedInputUrl = normalizeScanCacheKey(inputUrl);
    const errors = validateScanInput({ inputUrl });

    if (errors.length) {
      return sendError(res, errors.join(' '), 400);
    }

    const cachedResult = getCachedScanResult(normalizedInputUrl);
    if (cachedResult) {
      const cachedScan = await Scan.create({
        inputType: 'url',
        inputUrl: inputUrl.trim(),
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

      return sendSuccess(res, cachedScan, 201);
    }

    let sourceText = '';
    let technicalSeo = null;

    const analysis = await analyzeTechnicalSeo(inputUrl.trim());
    sourceText = normalizeWhitespace(analysis.contentText || analysis.visibleText || '');
    technicalSeo = analysis.technicalSeo;

    const scoreSource = sourceText;
    const result = scoreContent(scoreSource);
    const contentScore = result.totalScore;
    const technicalScore = technicalSeo?.score || 0;
    const totalScore = Math.round(contentScore * 0.75 + technicalScore * 0.25);
    const technicalCoverage = technicalSeo?.coverage || 'full';

    const scan = await Scan.create({
      inputType: 'url',
      inputUrl: inputUrl.trim(),
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

    return sendSuccess(res, scan, 201);
  } catch (error) {
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
