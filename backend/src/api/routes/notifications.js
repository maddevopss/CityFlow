'use strict';

const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate } = require('../middleware/auth');
const { citizenReadLimiter } = require('../middleware/rateLimiters');

const router = express.Router();
const querySchema = Joi.object({
  eventType: Joi.string().trim().max(80),
  status: Joi.string().valid('PENDING', 'SENT', 'FAILED', 'READ'),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(25)
});

router.use(citizenReadLimiter);
router.use(authenticate);

router.get('/', async (req, res) => {
  const { error, value } = querySchema.validate(req.query, { convert: true, stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Filtres invalides' });
  const { eventType, status, page, pageSize } = value;
  const where = {
    municipalityId: req.user.municipalityId,
    recipientId: req.user.sub,
    ...(eventType ? { eventType } : {}),
    ...(status ? { status } : {})
  };
  const [total, items] = await prisma.$transaction([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);
  return res.json({
    items,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
  });
});

module.exports = router;
