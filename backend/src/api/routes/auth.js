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

  await prisma.$transaction(async tx => {
    await tx.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });
    await createSession(tx, {
      userId: user.id,
      tokenId,
      expiresAt: new Date(decoded.exp * 1000)
    });
  });

  return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

router.post('/logout', authReadLimiter, authenticate, async (req, res) => {
  await revokeSession(prisma, { userId: req.user.sub, tokenId: req.user.jti });
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
