const Scan = require('../models/Scan');
const { validateScanInput, isValidObjectId } = require('../utils/validators');
const { sendError, sendSuccess } = require('../utils/responseHelper');
const { extractTextFromUrl, normalizeWhitespace } = require('../services/scanService');
const { scoreContent } = require('../services/scoringEngine');

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

    const sourceText =
      inputType === 'url'
        ? await extractTextFromUrl(inputUrl.trim())
        : normalizeWhitespace(inputText);
    const result = scoreContent(sourceText);

    scan.inputText = sourceText;
    scan.score = result.totalScore;
    scan.explanation = result.explanation;
    scan.breakdown = result.breakdown;
    scan.recommendations = result.recommendations;
    scan.status = 'completed';
    await scan.save();

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
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const [scans, total] = await Promise.all([
      Scan.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Scan.countDocuments()
    ]);

    return sendSuccess(res, { scans, total, page, limit }, 200);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createScan,
  getScanById,
  getHistory
};
