const Scan = require('../models/Scan');
const { validateScanInput, isValidObjectId } = require('../utils/validators');
const { sendError, sendSuccess } = require('../utils/responseHelper');
const { normalizeWhitespace } = require('../services/scanService');
const { scoreContent } = require('../services/scoringEngine');
const { analyzeTechnicalSeo } = require('../services/technicalSeoService');
const { pruneScansByUser } = require('../services/scanRetentionService');

const createScan = async (req, res, next) => {
  try {
    const { inputUrl } = req.body;
    const errors = validateScanInput({ inputUrl });

    if (errors.length) {
      return sendError(res, errors.join(' '), 400);
    }

    const scan = await Scan.create({
      inputType: 'url',
      inputUrl: inputUrl.trim(),
      status: 'pending'
    });

    scan.status = 'processing';
    await scan.save();

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
    scan.analysisSource = 'hybrid';
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

module.exports = {
  createScan,
  getScanById
};
