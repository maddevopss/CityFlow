'use strict';

const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { citizenWriteLimiter, citizenReadLimiter } = require('../middleware/rateLimiters');
const { escalateCitizenRequestServiceLevels } = require('../../services/citizenRequestEscalations');
const { listCitizenEscalationRuns, recordCitizenEscalationRun } = require('../../services/citizenEscalationRunHistory');
const { getCitizenEscalationRetentionConfig } = require('../../services/citizenEscalationConfig');
const {
  CitizenEscalationAlreadyRunningError,
  executeCitizenEscalationWithLock
} = require('../../services/citizenEscalationExecutionLock');

const router = express.Router();
const historySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(25)
});

function citizenEscalationLimiter(req, res, next) {
  const limiter = req.method === 'GET' ? citizenReadLimiter : citizenWriteLimiter;
  return limiter(req, res, next);
}

router.use(
  citizenEscalationLimiter,
  authenticate,
  authorize('ADMIN', 'MANAGER')
);

router.get('/history', async (req, res) => {
  const { error, value } = historySchema.validate(req.query, { convert: true, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      message: 'Données invalides',
      details: error.details.map((item) => item.message)
    });
  }

  const items = await listCitizenEscalationRuns(prisma, req.user.municipalityId, value.limit);
  const retention = getCitizenEscalationRetentionConfig();
  return res.json({ items, limit: value.limit, retention });
});

router.post('/run', async (req, res) => {
  const startedAt = new Date();
  try {
    const result = await executeCitizenEscalationWithLock(
      prisma,
      req.user.municipalityId,
      (db) => escalateCitizenRequestServiceLevels(db, req.user.municipalityId, startedAt)
    );
    const completedAt = new Date();
    await recordCitizenEscalationRun(prisma, {
      municipalityId: req.user.municipalityId,
      source: 'MANUAL',
      status: 'SUCCESS',
      ...result,
      startedAt,
      completedAt,
      durationMs: completedAt - startedAt
    });

    return res.status(202).json({ generatedAt: completedAt.toISOString(), ...result });
  } catch (error) {
    if (error instanceof CitizenEscalationAlreadyRunningError) {
      return res.status(409).json({ message: error.message, code: error.code });
    }
    const completedAt = new Date();
    await recordCitizenEscalationRun(prisma, {
      municipalityId: req.user.municipalityId,
      source: 'MANUAL',
      status: 'FAILED',
      startedAt,
      completedAt,
      durationMs: completedAt - startedAt,
      errorMessage: error.message
    });
    throw error;
  }
});

module.exports = router;
