const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const config = require('../../config');
const { authenticate } = require('../middleware/auth');
const { loginLimiter, authReadLimiter } = require('../middleware/rateLimiters');

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

  if (!user || !bcrypt.compareSync(value.password, user.password)) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role, municipalityId: user.municipalityId },
    config.jwtSecret,
    { expiresIn: config.jwtExpiration }
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  });

  return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
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
