const mongoose = require('mongoose');

const BreakdownSchema = new mongoose.Schema(
  {
    factor: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    weight: { type: Number, required: true },
    explanation: { type: String, required: true }
  },
  { _id: false }
);

const TechnicalCheckSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    status: { type: String, enum: ['found', 'missing', 'invalid', 'blocked'], required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    weight: { type: Number, required: true },
    explanation: { type: String, required: true },
    evidence: [{ type: String }]
  },
  { _id: false }
);

const TechnicalSeoSchema = new mongoose.Schema(
  {
    score: { type: Number, min: 0, max: 100 },
    checks: [TechnicalCheckSchema],
    evidence: {
      finalUrl: { type: String },
      canonicalUrl: { type: String },
      robotsUrl: { type: String },
      sitemapUrls: [{ type: String }],
      schemaCount: { type: Number }
    }
  },
  { _id: false }
);

const ScanSchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'anonymous' },
    inputType: { type: String, enum: ['url', 'text', 'file'], required: true },
    inputUrl: { type: String, trim: true },
    inputText: { type: String },
    fileName: { type: String },
    fileType: { type: String },
    fileUrl: { type: String },
    filePublicId: { type: String },
    contentScore: { type: Number, min: 0, max: 100 },
    technicalScore: { type: Number, min: 0, max: 100 },
    score: { type: Number, min: 0, max: 100 },
    explanation: { type: String },
    breakdown: [BreakdownSchema],
    technicalSeo: TechnicalSeoSchema,
    recommendations: [{ type: String }],
    analysisSource: { type: String, enum: ['local', 'hybrid', 'backend'], default: 'local' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

ScanSchema.index({ userId: 1, createdAt: -1 });
ScanSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Scan', ScanSchema);
