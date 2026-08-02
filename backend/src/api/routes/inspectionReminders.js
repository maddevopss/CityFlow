const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const {
  operationsReadLimiter,
  operationsWriteLimiter
} = require('../middleware/rateLimiters');

const router = express.Router();
const authorizeReminderAccess = [
  authenticate,
  authorize('ADMIN', 'MUNICIPAL_AGENT', 'INSPECTOR')
];

router.get('/', operationsReadLimiter, ...authorizeReminderAccess, async (req, res) => {
  const reminders = await prisma.inspectionReminder.findMany({
    where: {
      municipalityId: req.user.municipalityId,
      ...(req.user.role === 'INSPECTOR' ? { recipientId: req.user.sub } : {})
    },
    orderBy: { scheduledFor: 'asc' }
  });

  return res.json(reminders);
});

router.post(
  '/generate',
  operationsWriteLimiter,
  authenticate,
  authorize('ADMIN', 'MUNICIPAL_AGENT'),
  async (req, res) => {
    const now = new Date();
    const horizon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const inspections = await prisma.inspection.findMany({
      where: {
        municipalityId: req.user.municipalityId,
        status: 'SCHEDULED',
        assignedTo: { not: null },
        scheduledAt: { gt: now, lte: horizon }
      },
      select: { id: true, assignedTo: true, scheduledAt: true }
    });

    const created = [];
    for (const inspection of inspections) {
      const reminder = await prisma.inspectionReminder.upsert({
        where: {
          inspectionId_recipientId_reminderType_scheduledFor: {
            inspectionId: inspection.id,
            recipientId: inspection.assignedTo,
            reminderType: 'INSPECTION_DUE_24H',
            scheduledFor: inspection.scheduledAt
          }
        },
        update: {},
        create: {
          municipalityId: req.user.municipalityId,
          inspectionId: inspection.id,
          recipientId: inspection.assignedTo,
          reminderType: 'INSPECTION_DUE_24H',
          scheduledFor: inspection.scheduledAt
        }
      });
      created.push(reminder);
    }

    return res.status(201).json({ generated: created.length, reminders: created });
  }
);

router.post(
  '/:id/acknowledge',
  operationsWriteLimiter,
  ...authorizeReminderAccess,
  async (req, res) => {
    const { error } = Joi.string().uuid().validate(req.params.id);
    if (error) {
      return res.status(400).json({ message: 'Identifiant de rappel invalide' });
    }

    const reminder = await prisma.inspectionReminder.findFirst({
      where: {
        id: req.params.id,
        municipalityId: req.user.municipalityId,
        ...(req.user.role === 'INSPECTOR' ? { recipientId: req.user.sub } : {})
      }
    });
    if (!reminder) {
      return res.status(404).json({ message: 'Rappel introuvable' });
    }

    const updated = await prisma.inspectionReminder.update({
      where: { id: reminder.id },
      data: { status: 'ACKNOWLEDGED', acknowledgedAt: new Date() }
    });

    return res.json(updated);
  }
);

module.exports = router;
