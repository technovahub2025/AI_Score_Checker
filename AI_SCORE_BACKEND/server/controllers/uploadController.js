const multer = require('multer');
const Scan = require('../models/Scan');
const { sendError, sendSuccess } = require('../utils/responseHelper');
const { uploadBuffer } = require('../services/cloudinaryService');
const { extractTextFromUpload, normalizeWhitespace } = require('../services/scanService');
const { scoreContent } = require('../services/scoringEngine');
const { pruneScansByUser } = require('../services/scanRetentionService');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) {
      const error = new Error('Only JPEG, PNG, and PDF files are allowed.');
      error.statusCode = 400;
      return cb(error);
    }
    return cb(null, true);
  }
});

const uploadScan = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'A file is required.', 400);
    }

    const uploaded = await uploadBuffer(req.file.buffer, {
      public_id: `scan-${Date.now()}`
    });
    const extractedText = normalizeWhitespace(await extractTextFromUpload(req.file));
    const result = scoreContent(extractedText);

    const scan = await Scan.create({
      inputType: 'file',
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileUrl: uploaded.secure_url,
      filePublicId: uploaded.public_id,
      inputText: extractedText,
      status: 'pending'
    });

    scan.status = 'processing';
    await scan.save();

    scan.score = result.totalScore;
    scan.contentScore = result.totalScore;
    scan.technicalScore = 0;
    scan.explanation = result.explanation;
    scan.breakdown = result.breakdown;
    scan.recommendations = result.recommendations;
    scan.analysisSource = 'backend';
    scan.status = 'completed';
    await scan.save();

    try {
      await pruneScansByUser({ userId: scan.userId });
    } catch (cleanupError) {
      void cleanupError;
    }

    return sendSuccess(res, scan, 201);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  upload,
  uploadScan
};
