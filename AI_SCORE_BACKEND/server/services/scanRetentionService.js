const Scan = require('../models/Scan');

const DEFAULT_RETENTION_DAYS = 30;

const toPositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getRetentionConfig = () => ({
  retentionDays: toPositiveInt(process.env.SCAN_RETENTION_DAYS, DEFAULT_RETENTION_DAYS)
});

const pruneScansByUser = async ({ userId = 'anonymous' } = {}) => {
  const { retentionDays } = getRetentionConfig();
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  const staleDeleteResult = await Scan.deleteMany({
    userId,
    createdAt: { $lt: cutoff }
  });

  return {
    removedStaleCount: staleDeleteResult.deletedCount || 0,
    removedOverflowCount: 0
  };
};

const pruneScans = async () => {
  const { retentionDays } = getRetentionConfig();
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  const staleDeleteResult = await Scan.deleteMany({
    createdAt: { $lt: cutoff }
  });

  return {
    removedStaleCount: staleDeleteResult.deletedCount || 0
  };
};

module.exports = {
  getRetentionConfig,
  pruneScansByUser,
  pruneScans
};
