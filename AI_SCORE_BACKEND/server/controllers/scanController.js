const Scan = require('../models/Scan');
const { validateScanInput, isValidObjectId } = require('../utils/validators');
const { sendError, sendSuccess } = require('../utils/responseHelper');
const { normalizeWhitespace } = require('../services/scanService');
const { scoreContent } = require('../services/scoringEngine');
const { analyzeTechnicalSeo } = require('../services/technicalSeoService');
const { pruneScansByUser } = require('../services/scanRetentionService');

const createScan = async (req, res, next) => {
  try {
    const { inputType, inputUrl, inputText } = req.body;
    const errors = validateScanInput({ inputType, inputUrl, inputText });

    if (errors.length) {
      return sendError(res, errors.join(' '), 400);
    }

    const scan = await Scan.create({
      inputType,
      inputUrl: inputType === 'url' ? inputUrl.trim() : undefined,
      inputText: inputType === 'text' ? normalizeWhitespace(inputText) : undefined,
      status: 'pending'
    });

    scan.status = 'processing';
    await scan.save();

    let sourceText = normalizeWhitespace(inputText);
    let technicalSeo = null;

    if (inputType === 'url') {
      const analysis = await analyzeTechnicalSeo(inputUrl.trim());
      sourceText = normalizeWhitespace(analysis.contentText || analysis.visibleText || '');
      technicalSeo = analysis.technicalSeo;
    }

    const scoreSource = inputType === 'url' ? sourceText || inputUrl.trim() : sourceText;
    const result = scoreContent(scoreSource);
    const contentScore = result.totalScore;
    const technicalScore = technicalSeo?.score || 0;
    const totalScore = inputType === 'url' ? Math.round(contentScore * 0.75 + technicalScore * 0.25) : contentScore;
    const technicalCoverage = technicalSeo?.coverage || 'full';

    scan.inputText = sourceText;
    scan.contentScore = contentScore;
    scan.technicalScore = technicalScore;
    scan.score = totalScore;
    scan.explanation = result.explanation;
    scan.breakdown = result.breakdown;
    scan.technicalSeo = technicalSeo;
    scan.analysisCoverage = technicalCoverage;
    scan.analysisLimited = technicalCoverage !== 'full';
    scan.recommendations = result.recommendations;
    scan.analysisSource = inputType === 'url' ? 'hybrid' : 'backend';
    scan.status = 'completed';
    await scan.save();

    try {
      await pruneScansByUser({ userId: scan.userId });
    } catch (cleanupError) {
      void cleanupError;
    }

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

    const scan = await Scan.findById(id);
    if (!scan) {
      return sendError(res, 'Scan not found.', 404);
    }

    return sendSuccess(res, scan, 200);
  } catch (error) {
    return next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 200);
    const skip = (page - 1) * limit;
    const userId = String(req.query.userId || 'anonymous');

    try {
      await pruneScansByUser({ userId });
    } catch (cleanupError) {
      void cleanupError;
    }

    const [scans, total] = await Promise.all([
      Scan.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Scan.countDocuments({ userId })
    ]);

    return sendSuccess(res, { scans, total, page, limit, hasMore: skip + scans.length < total }, 200);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createScan,
  getScanById,
  getHistory
};
