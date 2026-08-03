const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const config = require('../../config');
const { authenticate } = require('../middleware/auth');
const { loginLimiter, authReadLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

const LEGAL_DOCUMENTS = Object.freeze({
  TERMS: Object.freeze({ id: 'LEGAL-TERMS-001', version: '0.1.0' }),
  PRIVACY: Object.freeze({ id: 'LEGAL-PRIVACY-QC-001', version: '0.1.0' })
});

const email = Joi.string().trim().lowercase().email({ tlds: { allow: false } }).max(254).required();
const loginSchema = Joi.object({ email, password: Joi.string().min(1).max(128).required() });
const registerSchema = Joi.object({
  municipalityName: Joi.string().trim().min(2).max(120).required(),
  fullName: Joi.string().trim().min(2).max(120).required(),
  email,
  password: Joi.string().min(12).max(128).required(),
  acceptedTerms: Joi.boolean().valid(true).required()
});

async function appendLegalConsent(tx, { userId, municipalityId, consentType, document, requestId }) {
  const consentId = crypto.randomUUID();
  await tx.$executeRaw`
    INSERT INTO "LegalConsent" (
      "id", "userId", "municipalityId", "consentType", "status",
      "documentId", "documentVersion", "source", "acceptedAt",
      "requestId", "metadata", "createdAt"
    ) VALUES (
      ${consentId}::uuid, ${userId}::uuid, ${municipalityId}, ${consentType},
      'ACCEPTED', ${document.id}, ${document.version}, 'PUBLIC_REGISTRATION',
      NOW(), ${requestId || null}, '{}'::jsonb, NOW()
    )
  `;
}

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

      await appendLegalConsent(tx, {
        userId: user.id,
        municipalityId: municipality.id,
        consentType: 'TERMS_OF_USE',
        document: LEGAL_DOCUMENTS.TERMS,
        requestId: req.requestId
      });
      await appendLegalConsent(tx, {
        userId: user.id,
        municipalityId: municipality.id,
        consentType: 'PRIVACY_POLICY',
        document: LEGAL_DOCUMENTS.PRIVACY,
        requestId: req.requestId
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

module.exports = router;
module.exports.LEGAL_DOCUMENTS = LEGAL_DOCUMENTS;
module.exports.appendLegalConsent = appendLegalConsent;
