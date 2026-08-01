'use strict';

const express = require('express');
const prisma = require('../../db/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { citizenWriteLimiter } = require('../middleware/rateLimiters');
const { escalateCitizenRequestServiceLevels } = require('../../services/citizenRequestEscalations');

const router = express.Router();

router.use(authenticate, authorize('ADMIN', 'MANAGER'));

router.post('/run', citizenWriteLimiter, async (req, res) => {
  const result = await escalateCitizenRequestServiceLevels(
    prisma,
    req.user.municipalityId,
    new Date()
  );

  res.status(202).json({
    generatedAt: new Date().toISOString(),
    ...result
  });
});

module.exports = router;
