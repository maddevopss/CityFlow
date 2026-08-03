const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const config = require('../../config');
const { authenticate } = require('../middleware/auth');
const { loginLimiter, authReadLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

const email = Joi.string().trim().lowercase().email({ tlds: { allow: false } }).max(254).required();
const loginSchema = Joi.object({ email, password: Joi.string().min(1).max(128).required() });
const registerSchema = Joi.object({
  municipalityName: Joi.string().trim().min(2).max(120).required(),
  fullName: Joi.string().trim().min(2).max(120).required(),
  email,
  password: Joi.string().min(12).max(128).required(),
  acceptedTerms: Joi.boolean().valid(true).required()
});

router.post('/register', loginLimiter, async (req, res) => {
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Informations d’inscription invalides' });

  const existing = await prisma.user.findUnique({ where: { email: value.email }, select: { id: true } });
  if (existing) return res.status(409).json({ message: 'Un compte existe déjà pour ce courriel' });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const municipality = await tx.municipality.create({ data: { name: value.municipalityName } });
      const user = await tx.user.create({
        data: {
          email: value.email,
          password: bcrypt.hashSync(value.password, 12),
          fullName: value.fullName,
          role: 'ADMIN',
          municipalityId: municipality.id
        },
        select: { id: true, email: true, fullName: true, role: true, municipalityId: true }
      });
      return { municipality: { id: municipality.id, name: municipality.name }, user };
    });
    return res.status(201).json(result);
  } catch (err) {
    if (err?.code === 'P2002') return res.status(409).json({ message: 'La municipalité ou le courriel existe déjà' });
    throw err;
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Identifiants invalides' });

  const user = await prisma.user.findUnique({ where: { email: value.email } });
  if (!user || !user.isActive || !bcrypt.compareSync(value.password, user.password)) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role, municipalityId: user.municipalityId },
    config.jwtSecret,
    { expiresIn: config.jwtExpiration }
  );

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
  return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

router.get('/me', authReadLimiter, authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.sub },
    select: { id: true, email: true, fullName: true, role: true, municipalityId: true }
  });
  if (!user) return res.status(401).json({ message: 'Session invalide' });
  return res.json(user);
});

router.use(require('./passwordRecovery'));

module.exports = router;
