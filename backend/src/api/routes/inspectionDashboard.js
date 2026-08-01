const express = require('express');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, authorize('ADMIN', 'MUNICIPAL_AGENT', 'INSPECTOR'));

router.get('/', async (req, res) => {
  const where = {
    municipalityId: req.user.municipalityId,
    ...(req.user.role === 'INSPECTOR' ? { assignedTo: req.user.sub } : {})
  };

  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

  const [byStatus, byOutcome, upcoming, overdue, unassigned, unreadReminders] = await Promise.all([
    prisma.inspection.groupBy({ by: ['status'], where, _count: { _all: true } }),
    prisma.inspection.groupBy({ by: ['outcome'], where: { ...where, outcome: { not: null } }, _count: { _all: true } }),
    prisma.inspection.count({ where: { ...where, status: 'SCHEDULED', scheduledAt: { gte: now, lt: weekEnd } } }),
    prisma.inspection.count({ where: { ...where, status: 'SCHEDULED', scheduledAt: { lt: now } } }),
    req.user.role === 'INSPECTOR' ? Promise.resolve(0) : prisma.inspection.count({ where: { ...where, status: 'SCHEDULED', assignedTo: null } }),
    prisma.inspectionReminder.count({ where: { municipalityId: req.user.municipalityId, recipientId: req.user.sub, acknowledgedAt: null } })
  ]);

  const status = Object.fromEntries(byStatus.map(item => [item.status, item._count._all]));
  const outcomes = Object.fromEntries(byOutcome.map(item => [item.outcome, item._count._all]));
  const total = Object.values(status).reduce((sum, count) => sum + count, 0);
  const completed = status.COMPLETED || 0;

  res.json({
    total,
    scheduled: status.SCHEDULED || 0,
    completed,
    cancelled: status.CANCELLED || 0,
    upcoming,
    overdue,
    unassigned,
    unreadReminders,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    outcomes
  });
});

module.exports = router;
