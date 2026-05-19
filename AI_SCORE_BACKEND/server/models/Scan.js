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

const ScanSchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'anonymous' },
    inputType: { type: String, enum: ['url', 'text', 'file'], required: true },
    inputUrl: { type: String, trim: true },
    inputText: { type: String },
    fileUrl: { type: String },
    filePublicId: { type: String },
    score: { type: Number, min: 0, max: 100 },
    explanation: { type: String },
    breakdown: [BreakdownSchema],
    recommendations: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scan', ScanSchema);
