const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { operationsReadLimiter } = require('../middleware/rateLimiters');

const router = express.Router();
router.use(
  operationsReadLimiter,
  authenticate,
  authorize('ADMIN', 'MUNICIPAL_AGENT', 'INSPECTOR')
);

const rangeSchema = Joi.object({
  from: Joi.date().iso().required(),
  to: Joi.date().iso().greater(Joi.ref('from')).required(),
  inspectorId: Joi.string().uuid().optional()
});

function scope(req, inspectorId) {
  return req.user.role === 'INSPECTOR' ? req.user.sub : inspectorId;
}

router.get('/', async (req, res) => {
  const { error, value } = rangeSchema.validate(req.query, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Plage de calendrier invalide' });

  const assignedTo = scope(req, value.inspectorId);
  const inspections = await prisma.inspection.findMany({
    where: {
      municipalityId: req.user.municipalityId,
      scheduledAt: { gte: new Date(value.from), lt: new Date(value.to) },
      ...(assignedTo ? { assignedTo } : {})
    },
    select: {
      id: true,
      scheduledAt: true,
      address: true,
      inspectionType: true,
      status: true,
      assignedTo: true
    },
    orderBy: { scheduledAt: 'asc' }
  });

  const conflicts = inspections.filter((item, index) =>
    item.assignedTo && inspections.some((other, otherIndex) =>
      otherIndex !== index && other.assignedTo === item.assignedTo &&
      Math.abs(new Date(other.scheduledAt) - new Date(item.scheduledAt)) < 60 * 60 * 1000
    )
  ).map(item => item.id);

  return res.json({ inspections, conflicts: [...new Set(conflicts)] });
});

router.get('/export.ics', async (req, res) => {
  const { error, value } = rangeSchema.validate(req.query, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Plage de calendrier invalide' });

  const assignedTo = scope(req, value.inspectorId);
  const inspections = await prisma.inspection.findMany({
    where: {
      municipalityId: req.user.municipalityId,
      scheduledAt: { gte: new Date(value.from), lt: new Date(value.to) },
      ...(assignedTo ? { assignedTo } : {})
    },
    orderBy: { scheduledAt: 'asc' }
  });

  const stamp = date => new Date(date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const events = inspections.map(item => [
    'BEGIN:VEVENT',
    `UID:${item.id}@cityflow`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(item.scheduledAt)}`,
    `DTEND:${stamp(new Date(new Date(item.scheduledAt).getTime() + 60 * 60 * 1000))}`,
    `SUMMARY:Inspection ${item.inspectionType}`,
    `LOCATION:${String(item.address).replace(/[\n,;]/g, ' ')}`,
    'END:VEVENT'
  ].join('\r\n')).join('\r\n');

  res.type('text/calendar').set('Content-Disposition', 'attachment; filename="inspections.ics"');
  return res.send(`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//CityFlow//Inspections//FR\r\n${events}\r\nEND:VCALENDAR\r\n`);
});

module.exports = router;
