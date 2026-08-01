const express = require('express');
const crypto = require('crypto');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const config = require('../../config');
const { permitWebhookLimiter } = require('../middleware/rateLimiters');
const { authenticate, authorize } = require('../middleware/auth');
const { ingestPermit } = require('../../services/permitIngestion');
const { transitionPermit } = require('../../services/permitDecision');
const { listPermitDocuments, addPermitDocument, reviewPermitDocument } = require('../../services/permitDocuments');
const { ALLOWED_STATUSES, listMunicipalPermits, getMunicipalPermitDetail } = require('../../services/permitRegister');

const router = express.Router();
const registerQuerySchema = Joi.object({ status: Joi.string().valid(...ALLOWED_STATUSES), q: Joi.string().trim().max(100).allow(''), page: Joi.number().integer().min(1).default(1), pageSize: Joi.number().integer().min(1).max(100).default(25) });
const permitIdSchema = Joi.string().guid({ version: ['uuidv4'] }).required();
const documentIdSchema = Joi.string().guid({ version: ['uuidv4'] }).required();
const reasonSchema = Joi.object({ reason: Joi.string().trim().min(3).max(1000).required() });
const documentSchema = Joi.object({
  documentType: Joi.string().trim().min(2).max(100).required(),
  fileName: Joi.string().trim().min(1).max(255).required(),
  mimeType: Joi.string().trim().max(150).required(),
  sizeBytes: Joi.number().integer().min(1).max(25 * 1024 * 1024).required(),
  storageKey: Joi.string().trim().min(3).max(500).required(),
  sha256: Joi.string().hex().length(64).required(),
  description: Joi.string().trim().max(1000).allow('', null)
});
const documentReviewSchema = Joi.object({ status: Joi.string().valid('ACCEPTED', 'REJECTED').required(), reason: Joi.string().trim().max(1000).allow('', null) });
const permitSchema = Joi.object({ permit_id: Joi.string().trim().max(100).required(), contractor: Joi.string().trim().max(200).allow('', null), start_date: Joi.date().iso().required(), end_date: Joi.date().iso().min(Joi.ref('start_date')).allow(null), municipalityId: Joi.number().integer().positive().required(), geometry: Joi.object({ type: Joi.string().valid('Point', 'LineString', 'Polygon').required(), coordinates: Joi.array().required() }).required(), impacts: Joi.array().items(Joi.string().trim().max(100)).default([]) });

function safeEqual(expected, received) { const a = Buffer.from(expected, 'utf8'); const b = Buffer.from(received || '', 'utf8'); return a.length === b.length && crypto.timingSafeEqual(a, b); }
function verifyPermitWebhook(req, res, next) {
  const timestamp = req.get('x-cityflow-timestamp'); const signature = req.get('x-cityflow-signature'); const seconds = Number(timestamp);
  if (!timestamp || !signature || !Number.isFinite(seconds)) return res.status(401).json({ message: 'Signature du webhook manquante' });
  if (Math.abs(Math.floor(Date.now() / 1000) - seconds) > config.permitWebhookToleranceSeconds) return res.status(401).json({ message: 'Signature du webhook expirée' });
  const expected = crypto.createHmac('sha256', config.permitWebhookSecret).update(`${timestamp}.${JSON.stringify(req.body)}`).digest('hex');
  if (!safeEqual(expected, signature)) return res.status(401).json({ message: 'Signature du webhook invalide' });
  next();
}
function validatePermitId(req, res) { const { error, value } = permitIdSchema.validate(req.params.permitId); if (error) { res.status(400).json({ message: 'Identifiant de permis invalide' }); return null; } return value; }
function mapPermitError(error, res, next) {
  if (error.code === 'PERMIT_NOT_FOUND') return res.status(404).json({ message: error.message, code: error.code });
  if (error.code === 'PERMIT_TRANSITION_CONFLICT') return res.status(409).json({ message: error.message, code: error.code, currentStatus: error.currentStatus, allowedFrom: error.allowedFrom });
  if (error.code === 'PERMIT_REASON_REQUIRED' || error.code === 'PERMIT_DOCUMENT_REASON_REQUIRED' || error.code === 'PERMIT_DOCUMENT_REVIEW_INVALID') return res.status(400).json({ message: error.message, code: error.code });
  if (error.code === 'PERMIT_DOCUMENT_NOT_FOUND') return res.status(404).json({ message: error.message, code: error.code });
  if (error.code === 'PERMIT_DOCUMENT_DUPLICATE') return res.status(409).json({ message: error.message, code: error.code });
  return next(error);
}
async function handleTransition(req, res, next, action, withReason = false) {
  try {
    const permitId = validatePermitId(req, res); if (!permitId) return;
    if (!req.user.municipalityId) return res.status(403).json({ message: 'Municipalité requise' });
    let reason = null;
    if (withReason) { const { error, value } = reasonSchema.validate(req.body); if (error) return res.status(400).json({ message: error.details[0].message }); reason = value.reason; }
    const permit = await transitionPermit(prisma, { permitId, municipalityId: req.user.municipalityId, action, actorId: req.user.sub, actorRole: req.user.role, reason });
    return res.json({ permit });
  } catch (error) { return mapPermitError(error, res, next); }
}

const municipalPermitAccess = [authenticate, authorize('ADMIN', 'MANAGER', 'MUNICIPAL_AGENT', 'VIEWER')];
router.get('/', ...municipalPermitAccess, async (req, res) => {
  const { error, value } = registerQuerySchema.validate(req.query, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Filtres de permis invalides', details: error.details.map((detail) => detail.message) });
  if (!req.user.municipalityId) return res.status(403).json({ message: 'Municipalité requise' });
  return res.json(await listMunicipalPermits(prisma, { municipalityId: req.user.municipalityId, ...value }));
});

router.post('/:permitId/submit', authenticate, authorize('ADMIN', 'MANAGER', 'MUNICIPAL_AGENT'), (req, res, next) => handleTransition(req, res, next, 'submit'));
router.post('/:permitId/approve', authenticate, authorize('ADMIN', 'MANAGER'), (req, res, next) => handleTransition(req, res, next, 'approve'));
router.post('/:permitId/reject', authenticate, authorize('ADMIN', 'MANAGER'), (req, res, next) => handleTransition(req, res, next, 'reject', true));
router.post('/:permitId/close', authenticate, authorize('ADMIN', 'MANAGER', 'MUNICIPAL_AGENT'), (req, res, next) => handleTransition(req, res, next, 'close', true));

router.get('/:permitId/documents', ...municipalPermitAccess, async (req, res, next) => {
  try { const permitId = validatePermitId(req, res); if (!permitId) return; return res.json(await listPermitDocuments(prisma, { permitId, municipalityId: req.user.municipalityId })); }
  catch (error) { return mapPermitError(error, res, next); }
});
router.post('/:permitId/documents', authenticate, authorize('ADMIN', 'MANAGER', 'MUNICIPAL_AGENT'), async (req, res, next) => {
  try {
    const permitId = validatePermitId(req, res); if (!permitId) return;
    const { error, value } = documentSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: 'Métadonnées de pièce invalides', details: error.details.map((detail) => detail.message) });
    const document = await addPermitDocument(prisma, { permitId, municipalityId: req.user.municipalityId, actorId: req.user.sub, actorRole: req.user.role, document: value });
    return res.status(201).json({ document });
  } catch (error) { return mapPermitError(error, res, next); }
});
router.post('/:permitId/documents/:documentId/review', authenticate, authorize('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const permitId = validatePermitId(req, res); if (!permitId) return;
    const { error: idError, value: documentId } = documentIdSchema.validate(req.params.documentId); if (idError) return res.status(400).json({ message: 'Identifiant de pièce invalide' });
    const { error, value } = documentReviewSchema.validate(req.body, { stripUnknown: true }); if (error) return res.status(400).json({ message: error.details[0].message });
    const document = await reviewPermitDocument(prisma, { permitId, documentId, municipalityId: req.user.municipalityId, actorId: req.user.sub, actorRole: req.user.role, status: value.status, reason: value.reason });
    return res.json({ document });
  } catch (error) { return mapPermitError(error, res, next); }
});

router.get('/:permitId', ...municipalPermitAccess, async (req, res) => {
  const permitId = validatePermitId(req, res); if (!permitId) return;
  if (!req.user.municipalityId) return res.status(403).json({ message: 'Municipalité requise' });
  const detail = await getMunicipalPermitDetail(prisma, { municipalityId: req.user.municipalityId, permitId });
  if (!detail) return res.status(404).json({ message: 'Permis introuvable' });
  return res.json(detail);
});

router.post('/hook', permitWebhookLimiter, verifyPermitWebhook, async (req, res, next) => {
  try {
    const { error, value } = permitSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: 'Données de permis invalides', details: error.details.map((detail) => detail.message) });
    const municipality = await prisma.municipality.findUnique({ where: { id: value.municipalityId }, select: { id: true } });
    if (!municipality) return res.status(404).json({ message: 'Municipalité inconnue' });
    const result = await ingestPermit(prisma, value);
    return res.status(result.operation === 'created' ? 201 : 200).json({ eventId: result.event.id, status: 'draft', operation: result.operation });
  } catch (error) {
    if (error.code === 'PERMIT_ALREADY_PROCESSED') return res.status(409).json({ message: 'Ce permis a déjà quitté l’état brouillon', code: error.code, eventId: error.eventId });
    return next(error);
  }
});
module.exports = router;
