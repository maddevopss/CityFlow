'use strict';

const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { citizenWriteLimiter, citizenReadLimiter } = require('../middleware/rateLimiters');
const { summarizeCitizenRequestServiceLevels } = require('../../services/citizenRequestServiceLevels');

const router = express.Router();
const municipalRoles = ['ADMIN', 'AGENT', 'MANAGER', 'MUNICIPAL_AGENT'];
const openStatuses = ['SUBMITTED', 'ACKNOWLEDGED', 'IN_REVIEW', 'PLANNED', 'IN_PROGRESS'];

const listSchema = Joi.object({
  status: Joi.string().valid('SUBMITTED', 'ACKNOWLEDGED', 'IN_REVIEW', 'PLANNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'),
  category: Joi.string().trim().max(80),
  assignedTeam: Joi.string().trim().max(120),
  unassigned: Joi.boolean(),
  q: Joi.string().trim().max(140),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(25)
});

const serviceLevelSchema = Joi.object({
  level: Joi.string().valid('ON_TRACK', 'AT_RISK', 'BREACHED', 'COMPLETED'),
  limit: Joi.number().integer().min(1).max(200).default(100)
});

const bulkAssignSchema = Joi.object({
  requestIds: Joi.array().items(Joi.string().uuid()).min(1).max(50).unique().required(),
  team: Joi.string().trim().min(2).max(120).required()
});

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      convert: true,
      stripUnknown: true
    });
    if (error) {
      return res.status(400).json({
        message: 'Données invalides',
        details: error.details.map((item) => item.message)
      });
    }
    req[source] = value;
    return next();
  };
}

function municipalCitizenRequestLimiter(req, res, next) {
  const limiter = req.method === 'GET' ? citizenReadLimiter : citizenWriteLimiter;
  return limiter(req, res, next);
}

router.use(
  municipalCitizenRequestLimiter,
  authenticate,
  authorize(...municipalRoles)
);

router.get('/summary', async (req, res) => {
  const municipalityId = req.user.municipalityId;
  const overdueBefore = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [byStatus, unassigned, overdue] = await Promise.all([
    prisma.citizenRequest.groupBy({
      by: ['status'],
      where: { municipalityId },
      _count: { _all: true }
    }),
    prisma.citizenRequest.count({
      where: { municipalityId, assignedTo: null, status: { in: openStatuses } }
    }),
    prisma.citizenRequest.count({
      where: { municipalityId, status: { in: openStatuses }, createdAt: { lt: overdueBefore } }
    })
  ]);

  return res.json({
    generatedAt: new Date().toISOString(),
    byStatus: Object.fromEntries(byStatus.map((row) => [row.status, row._count._all])),
    unassigned,
    overdue
  });
});

router.get('/service-levels', validate(serviceLevelSchema, 'query'), async (req, res) => {
  const requests = await prisma.citizenRequest.findMany({
    where: { municipalityId: req.user.municipalityId },
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      assignedTeam: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { createdAt: 'asc' },
    take: req.query.limit
  });

  const evaluated = summarizeCitizenRequestServiceLevels(requests);
  const items = req.query.level
    ? evaluated.items.filter((item) => item.serviceLevel.level === req.query.level)
    : evaluated.items;

  return res.json({
    generatedAt: new Date().toISOString(),
    summary: evaluated.summary,
    items
  });
});

router.get('/', validate(listSchema, 'query'), async (req, res) => {
  const { status, category, assignedTeam, unassigned, q, page, pageSize } = req.query;
  const where = {
    municipalityId: req.user.municipalityId,
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
    ...(assignedTeam ? { assignedTeam } : {}),
    ...(unassigned === true ? { assignedTo: null } : {}),
    ...(q ? {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ]
    } : {})
  };

  const [items, total] = await Promise.all([
    prisma.citizenRequest.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.citizenRequest.count({ where })
  ]);

  return res.json({
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  });
});

router.post('/bulk-assign', validate(bulkAssignSchema), async (req, res) => {
  const municipalityId = req.user.municipalityId;
  const { requestIds, team } = req.body;
  const existing = await prisma.citizenRequest.findMany({
    where: { municipalityId, id: { in: requestIds } },
    select: { id: true, status: true }
  });

  if (existing.length !== requestIds.length) {
    return res.status(404).json({ message: 'Une ou plusieurs demandes sont introuvables' });
  }

  const invalid = existing.filter((item) => !openStatuses.includes(item.status));
  if (invalid.length) {
    return res.status(409).json({
      message: 'Une ou plusieurs demandes ne peuvent plus être affectées',
      requestIds: invalid.map((item) => item.id)
    });
  }

  const assignedAt = new Date();
  const result = await prisma.$transaction(async (tx) => {
    const update = await tx.citizenRequest.updateMany({
      where: { municipalityId, id: { in: requestIds } },
      data: {
        assignedTo: req.user.sub,
        assignedTeam: team,
        assignedAt,
        status: 'IN_REVIEW'
      }
    });

    await tx.citizenRequestEvent.createMany({
      data: existing.map((item) => ({
        municipalityId,
        requestId: item.id,
        actorId: req.user.sub,
        eventType: 'REQUEST_ASSIGNED',
        fromStatus: item.status,
        toStatus: 'IN_REVIEW',
        metadata: { team, bulk: true }
      }))
    });

    return update;
  });

  return res.json({ updated: result.count, team, assignedAt: assignedAt.toISOString() });
});

module.exports = router;
