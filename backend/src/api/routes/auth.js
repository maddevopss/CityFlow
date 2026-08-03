const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { randomUUID } = require('crypto');
const prisma = require('../../db/prisma');
const config = require('../../config');
const { authenticate } = require('../middleware/auth');
const { loginLimiter, authReadLimiter } = require('../middleware/rateLimiters');
const { createSession, revokeSession } = require('../../services/authSession');
const { createRefreshToken, rotateRefreshToken } = require('../../services/refreshToken');
const { appendSecurityAudit } = require('../../services/securityAudit');

const router = express.Router();

const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .max(254)
    .required(),
  password: Joi.string().min(1).max(128).required()
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().min(32).max(256).required()
});

function getRefreshTokenExpiration() {
  return new Date(Date.now() + config.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
}

function issueAccessToken(user) {
  const tokenId = randomUUID();
  const token = jwt.sign(
    { sub: user.id, role: user.role, municipalityId: user.municipalityId },
    config.jwtSecret,
    {
      algorithm: config.jwtAlgorithm,
      expiresIn: config.jwtExpiration,
      issuer: config.jwtIssuer,
      audience: config.jwtAudience,
      jwtid: tokenId
    }
  );
  const decoded = jwt.decode(token);

  return {
    token,
    tokenId,
    expiresAt: new Date(decoded.exp * 1000)
  };
}

router.post('/login', loginLimiter, async (req, res) => {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({ message: 'Identifiants invalides' });
  }

  const user = await prisma.user.findUnique({ where: { email: value.email } });

  if (!user || !user.isActive || !bcrypt.compareSync(value.password, user.password)) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  const access = issueAccessToken(user);
  const refreshToken = await prisma.$transaction(async tx => {
    await tx.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });
    await createSession(tx, {
      userId: user.id,
      tokenId: access.tokenId,
      expiresAt: access.expiresAt
    });
    const refreshToken = await createRefreshToken(tx, {
      userId: user.id,
      expiresAt: getRefreshTokenExpiration()
    });
    await appendSecurityAudit({
      action: 'auth.login.succeeded',
      result: 'SUCCESS',
      municipalityId: user.municipalityId,
      actorId: user.id,
      requestId: req.requestId,
      db: tx
    });
    return refreshToken;
  });

  return res.json({
    token: access.token,
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role }
  });
});

router.post('/refresh', authReadLimiter, async (req, res) => {
  const { error, value } = refreshSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({ message: 'Jeton de renouvellement invalide' });
  }

  try {
    const rotated = await prisma.$transaction(async tx => {
      const rotation = await rotateRefreshToken(tx, {
        token: value.refreshToken,
        expiresAt: getRefreshTokenExpiration()
      });

      if (!rotation) {
        return null;
      }

      const user = await tx.user.findUnique({ where: { id: rotation.userId } });
      if (!user || !user.isActive) {
        const sessionError = new Error('SESSION_INVALID');
        sessionError.code = 'SESSION_INVALID';
        throw sessionError;
      }

      const access = issueAccessToken(user);
      await createSession(tx, {
        userId: user.id,
        tokenId: access.tokenId,
        expiresAt: access.expiresAt
      });

      await appendSecurityAudit({
        action: 'auth.refresh.succeeded',
        result: 'SUCCESS',
        municipalityId: user.municipalityId,
        actorId: user.id,
        requestId: req.requestId,
        db: tx
      });

      return {
        token: access.token,
        refreshToken: rotation.refreshToken
      };
    });

    if (!rotated) {
      return res.status(401).json({ message: 'Jeton de renouvellement invalide' });
    }

    return res.json(rotated);
  } catch (err) {
    if (err.code === 'SESSION_INVALID') {
      return res.status(401).json({ message: 'Session invalide' });
    }
    throw err;
  }
});

router.post('/logout', authReadLimiter, authenticate, async (req, res) => {
  await revokeSession(prisma, { userId: req.user.sub, tokenId: req.user.jti });
  await appendSecurityAudit({
    action: 'auth.logout.succeeded',
    result: 'SUCCESS',
    municipalityId: req.user.municipalityId,
    actorId: req.user.sub,
    requestId: req.requestId
  });
  return res.status(204).send();
});

router.get('/me', authReadLimiter, authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.sub },
    select: { id: true, email: true, fullName: true, role: true, municipalityId: true }
  });

  if (!user) {
    return res.status(401).json({ message: 'Session invalide' });
  }

  return res.json(user);
});

module.exports = router;
