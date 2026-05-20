const Scan = require('../models/Scan');

const DEFAULT_RETENTION_DAYS = 30;
const DEFAULT_RETENTION_LIMIT = 100;

const toPositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getRetentionConfig = () => ({
  retentionDays: toPositiveInt(process.env.SCAN_RETENTION_DAYS, DEFAULT_RETENTION_DAYS),
  retentionLimit: toPositiveInt(process.env.SCAN_RETENTION_LIMIT, DEFAULT_RETENTION_LIMIT)
});

const pruneScansByUser = async ({ userId = 'anonymous' } = {}) => {
  const { retentionDays, retentionLimit } = getRetentionConfig();
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  const staleDeleteResult = await Scan.deleteMany({
    userId,
    createdAt: { $lt: cutoff }
  });

  const remainingIds = await Scan.find({ userId })
    .sort({ createdAt: -1 })
    .skip(retentionLimit)
    .select('_id')
    .lean();

  if (!remainingIds.length) {
    return {
      removedStaleCount: staleDeleteResult.deletedCount || 0,
      removedOverflowCount: 0
    };
  }

  const overflowDeleteResult = await Scan.deleteMany({
    _id: { $in: remainingIds.map((item) => item._id) }
  });

  return {
    removedStaleCount: staleDeleteResult.deletedCount || 0,
    removedOverflowCount: overflowDeleteResult.deletedCount || 0
  };
};

module.exports = {
  getRetentionConfig,
  pruneScansByUser
};
