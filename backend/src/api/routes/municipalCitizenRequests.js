'use strict';

const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { citizenWriteLimiter, citizenReadLimiter } = require('../middleware/rateLimiters');

const router = express.Router();
const municipalRoles = ['ADMIN', 'AGENT', 'MANAGER', 'MUNICIPAL_AGENT'];
const listSchema = Joi.object({
  status: Joi.string().valid('SUBMITTED', 'ACKNOWLEDGED', 'IN_REVIEW', 'PLANNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'),
  category: Joi.string().trim().max(80),
  assignedTeam: Joi.string().trim().max(120),
  q: Joi.string().trim().max(140),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(25)
});
const bulkAssignSchema = Joi.object({
  requestIds: Joi.array().items(Joi.string().uuid()).min(1).max(50).required(),
  team: Joi.string().trim().min(2).max(120).required()
});

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: 'Données invalides', details: error.details.map(item => item.message) });
    req[source] = value;
    next();
  };
}

router.use(authenticate, authorize(...municipalRoles));

router.get('/summary', citizenReadLimiter, async (req, res) => {
  const municipalityId = req.user.municipalityId;
  const [byStatus, unassigned, overdue] = await Promise.all([
    prisma.citizenRequest.groupBy({ by: ['status'], where: { municipalityId }, _count: { _all: true } }),
    prisma.citizenRequest.count({ where: { municipalityId, assignedTeam: null, status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
    prisma.citizenRequest.count({ where: { municipalityId, status: { notIn: ['RESOLVED', 'CLOSED'] }, createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } })
  ]);
  res.json({
    generatedAt: new Date().toISOString(),
    byStatus: Object.fromEntries(byStatus.map(row => [row.status, row._count._all])),
    unassigned,
    overdue
  });
});

router.get('/', citizenReadLimiter, validate(listSchema, 'query'), async (req, res) => {
  const { status, category, assignedTeam, q, page, pageSize } = req.query;
  const where = {
    municipalityId: req.user.municipalityId,
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
    ...(assignedTeam ? { assignedTeam } : {}),
    ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] } : {})
  };
  const [items, total] = await Promise.all([
    prisma.citizenRequest.findMany({ where, orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }], skip: (page - 1) * pageSize, take: pageSize }),
    prisma.citizenRequest.count({ where })
  ]);
  res.json({ items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

router.post('/bulk-assign', citizenWriteLimiter, validate(bulkAssignSchema), async (req, res) => {
  const existing = await prisma.citizenRequest.findMany({
    where: { id: { in: req.body.requestIds }, municipalityId: req.user.municipalityId },
    select: { id: true }
  });
  if (existing.length !== req.body.requestIds.length) return res.status(404).json({ message: 'Une ou plusieurs demandes sont introuvables' });
  const result = await prisma.$transaction(async tx => {
    const update = await tx.citizenRequest.updateMany({
      where: { id: { in: req.body.requestIds }, municipalityId: req.user.municipalityId },
      data: { assignedTeam: req.body.team, assignedBy: req.user.sub, assignedAt: new Date(), status: 'IN_REVIEW' }
    });
    await tx.citizenRequestEvent.createMany({
      data: req.body.requestIds.map(requestId => ({ municipalityId: req.user.municipalityId, requestId, type: 'REQUEST_ASSIGNED', status: 'IN_REVIEW', actorId: req.user.sub, metadata: { team: req.body.team, bulk: true } }))
    });
    return update;
  });
  res.json({ updated: result.count, team: req.body.team });
});

module.exports = router;
