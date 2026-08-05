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

// Le cookie httpOnly est la source d'authentification attendue par le frontend
// (voir frontend/src/services/api.ts, withCredentials: true) ; le jeton reste
// aussi renvoyé dans le corps pour les clients Bearer (tests, intégrations).
// SameSite=lax est la protection CSRF réelle de ce cookie : elle bloque les
// requêtes de mutation cross-site (fetch/XHR/POST de formulaire) tout en
// laissant passer la navigation normale. Voir RSK-2026-001 pour l'historique.
function setAccessTokenCookie(res, access) {
  res.cookie('accessToken', access.token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
    expires: access.expiresAt
  });
}

function clearAccessTokenCookie(res) {
  res.clearCookie('accessToken', { path: '/' });
}

async function recordAuthFailure(action, req, metadata = {}) {
  try {
    await appendSecurityAudit({
      action,
      result: 'FAILURE',
      requestId: req.requestId,
      metadata
    });
  } catch (_err) {
    // Une panne du journal ne doit pas révéler l’état du compte au client.
  }
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
    await recordAuthFailure('auth.login.failed', req, { reason: 'invalid_payload' });
    return res.status(400).json({ message: 'Identifiants invalides' });
  }

  const user = await prisma.user.findUnique({ where: { email: value.email } });
  const passwordValid = user?.isActive ? bcrypt.compareSync(value.password, user.password) : false;

  if (!user || !user.isActive || !passwordValid) {
    await recordAuthFailure('auth.login.failed', req, {
      reason: !user ? 'unknown_account' : !user.isActive ? 'inactive_account' : 'invalid_password',
      municipalityId: user?.municipalityId ?? null,
      actorId: user?.id ?? null
    });
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

  setAccessTokenCookie(res, access);

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
    await recordAuthFailure('auth.refresh.failed', req, { reason: 'invalid_payload' });
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
        expiresAt: access.expiresAt,
        refreshToken: rotation.refreshToken
      };
    });

    if (!rotated) {
      await recordAuthFailure('auth.refresh.failed', req, { reason: 'invalid_or_consumed_token' });
      return res.status(401).json({ message: 'Jeton de renouvellement invalide' });
    }

    setAccessTokenCookie(res, { token: rotated.token, expiresAt: rotated.expiresAt });

    return res.json({ token: rotated.token, refreshToken: rotated.refreshToken });
  } catch (err) {
    if (err.code === 'SESSION_INVALID') {
      await recordAuthFailure('auth.refresh.failed', req, { reason: 'inactive_account' });
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
  clearAccessTokenCookie(res);
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
