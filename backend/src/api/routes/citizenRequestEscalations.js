'use strict';

const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { citizenWriteLimiter, citizenReadLimiter } = require('../middleware/rateLimiters');
const { escalateCitizenRequestServiceLevels } = require('../../services/citizenRequestEscalations');
const { listCitizenEscalationRuns } = require('../../services/citizenEscalationRunHistory');
const { getCitizenEscalationRetentionConfig } = require('../../services/citizenEscalationConfig');
const {
  CitizenEscalationAlreadyRunningError,
  executeCitizenEscalationWithLock
} = require('../../services/citizenEscalationExecutionLock');

const router = express.Router();
const historySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(25)
});

router.use(authenticate, authorize('ADMIN', 'MANAGER'));

router.get('/history', citizenReadLimiter, async (req, res) => {
  const { error, value } = historySchema.validate(req.query, { convert: true, stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Données invalides', details: error.details.map((item) => item.message) });

  const items = await listCitizenEscalationRuns(prisma, req.user.municipalityId, value.limit);
  const retention = getCitizenEscalationRetentionConfig();
  res.json({ items, limit: value.limit, retention });
});

router.post('/run', citizenWriteLimiter, async (req, res) => {
  try {
    const result = await executeCitizenEscalationWithLock(
      prisma,
      req.user.municipalityId,
      (db) => escalateCitizenRequestServiceLevels(db, req.user.municipalityId, new Date())
    );

    res.status(202).json({
      generatedAt: new Date().toISOString(),
      ...result
    });
  } catch (error) {
    if (error instanceof CitizenEscalationAlreadyRunningError) {
      return res.status(409).json({
        message: error.message,
        code: error.code
      });
    }
    throw error;
  }
});

module.exports = router;
