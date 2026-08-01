'use strict';

const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate } = require('../middleware/auth');
const { citizenWriteLimiter } = require('../middleware/rateLimiters');
const { createUploadGrant, verifyUploadGrant } = require('../../services/citizenUploadSecurity');

const router = express.Router({ mergeParams: true });
const paramsSchema = Joi.object({ requestId: Joi.string().uuid().required() });
const grantSchema = Joi.object({
  fileName: Joi.string().trim().min(1).max(255).required(),
  mimeType: Joi.string().trim().max(120).required(),
  sizeBytes: Joi.number().integer().min(1).required()
});
const completeSchema = Joi.object({
  grant: Joi.string().min(40).max(5000).required(),
  checksumSha256: Joi.string().hex().length(64).required()
});

function validate(schema, source) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: 'Données invalides', details: error.details.map(item => item.message) });
    req[source] = value;
    next();
  };
}

async function loadOwnedRequest(req, res, next) {
  const request = await prisma.citizenRequest.findFirst({
    where: { id: req.params.requestId, municipalityId: req.user.municipalityId }
  });
  if (!request) return res.status(404).json({ message: 'Demande introuvable' });
  const municipal = ['ADMIN', 'AGENT', 'MANAGER', 'MUNICIPAL_AGENT'].includes(req.user.role);
  if (!municipal && request.citizenId !== req.user.sub) return res.status(403).json({ message: 'Accès refusé' });
  req.citizenRequest = request;
  next();
}

router.use(authenticate, citizenWriteLimiter, validate(paramsSchema, 'params'), loadOwnedRequest);

router.post('/grant', validate(grantSchema, 'body'), async (req, res) => {
  const upload = createUploadGrant(req.body, {
    userId: req.user.sub,
    municipalityId: req.user.municipalityId,
    requestId: req.citizenRequest.id
  });
  res.status(201).json({
    ...upload,
    uploadMethod: 'PUT',
    uploadUrl: `${process.env.UPLOAD_BASE_URL || 'https://uploads.invalid'}/${encodeURIComponent(upload.storageKey)}`,
    requiredHeaders: { 'content-type': upload.mimeType, 'x-content-sha256': 'required' }
  });
});

router.post('/complete', validate(completeSchema, 'body'), async (req, res) => {
  const payload = verifyUploadGrant(req.body.grant, {
    userId: req.user.sub,
    municipalityId: req.user.municipalityId,
    requestId: req.citizenRequest.id
  });
  const current = Array.isArray(req.citizenRequest.attachments) ? req.citizenRequest.attachments : [];
  if (current.length >= 10) return res.status(409).json({ message: 'Limite de pièces jointes atteinte' });
  const attachment = {
    storageKey: payload.storageKey,
    checksumSha256: req.body.checksumSha256,
    uploadedBy: req.user.sub,
    completedAt: new Date().toISOString()
  };
  const updated = await prisma.$transaction(async tx => {
    const request = await tx.citizenRequest.update({
      where: { id: req.citizenRequest.id },
      data: { attachments: [...current, attachment] }
    });
    await tx.citizenRequestEvent.create({
      data: {
        municipalityId: req.user.municipalityId,
        requestId: request.id,
        type: 'ATTACHMENT_ADDED',
        status: request.status,
        actorId: req.user.sub,
        metadata: { storageKey: payload.storageKey, checksumSha256: req.body.checksumSha256 }
      }
    });
    return request;
  });
  res.status(201).json({ attachment, requestId: updated.id });
});

module.exports = router;
