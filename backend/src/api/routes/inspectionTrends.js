const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, authorize('ADMIN', 'MUNICIPAL_AGENT', 'INSPECTOR'));

router.get('/', async (req, res) => {
  const { error, value } = Joi.object({ months: Joi.number().integer().min(1).max(12).default(6) }).validate(req.query);
  if (error) return res.status(400).json({ message: 'Période invalide' });

  const end = new Date();
  const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - value.months + 1, 1));
  const inspections = await prisma.inspection.findMany({
    where: {
      municipalityId: req.user.municipalityId,
      scheduledAt: { gte: start, lte: end },
      ...(req.user.role === 'INSPECTOR' ? { assignedTo: req.user.sub } : {})
    },
    select: { scheduledAt: true, completedAt: true, status: true, outcome: true }
  });

  const buckets = Array.from({ length: value.months }, (_, index) => {
    const date = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - value.months + 1 + index, 1));
    return { month: date.toISOString().slice(0, 7), scheduled: 0, completed: 0, compliant: 0, nonCompliant: 0 };
  });
  const byMonth = new Map(buckets.map(bucket => [bucket.month, bucket]));

  for (const inspection of inspections) {
    const scheduledBucket = byMonth.get(new Date(inspection.scheduledAt).toISOString().slice(0, 7));
    if (scheduledBucket) scheduledBucket.scheduled += 1;
    if (inspection.completedAt) {
      const completedBucket = byMonth.get(new Date(inspection.completedAt).toISOString().slice(0, 7));
      if (completedBucket) {
        completedBucket.completed += 1;
        if (inspection.outcome === 'COMPLIANT') completedBucket.compliant += 1;
        if (inspection.outcome === 'NON_COMPLIANT') completedBucket.nonCompliant += 1;
      }
    }
  }

  res.json({ period: { start, end, months: value.months }, trends: buckets });
});

module.exports = router;
