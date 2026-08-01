'use strict';

const express = require('express');
const Joi = require('joi');
const prisma = require('../../db/prisma');
const { authenticate } = require('../middleware/auth');
const { citizenWriteLimiter, citizenReadLimiter } = require('../middleware/rateLimiters');

const router = express.Router({ mergeParams: true });
const paramsSchema = Joi.object({ requestId: Joi.string().uuid().required() });
const messageSchema = Joi.object({ body: Joi.string().trim().min(1).max(4000).required() });

function validate(schema, source) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: 'Données invalides', details: error.details.map(item => item.message) });
    req[source] = value;
    next();
  };
}

async function loadAuthorizedRequest(req, res, next) {
  const request = await prisma.citizenRequest.findFirst({
    where: { id: req.params.requestId, municipalityId: req.user.municipalityId }
  });
  if (!request) return res.status(404).json({ message: 'Demande introuvable' });
  const isCitizenOwner = req.user.role === 'CITIZEN' && request.citizenId === req.user.sub;
  const isMunicipal = ['ADMIN', 'AGENT', 'MANAGER', 'MUNICIPAL_AGENT'].includes(req.user.role);
  if (!isCitizenOwner && !isMunicipal) return res.status(403).json({ message: 'Accès refusé' });
  req.citizenRequest = request;
  next();
}

router.use(authenticate, validate(paramsSchema, 'params'), loadAuthorizedRequest);

router.get('/', citizenReadLimiter, async (req, res) => {
  const messages = await prisma.citizenMessage.findMany({
    where: { requestId: req.citizenRequest.id, municipalityId: req.user.municipalityId },
    orderBy: { createdAt: 'asc' }
  });
  res.json(messages);
});

router.post('/', citizenWriteLimiter, validate(messageSchema, 'body'), async (req, res) => {
  const created = await prisma.$transaction(async tx => {
    const message = await tx.citizenMessage.create({
      data: {
        municipalityId: req.user.municipalityId,
        requestId: req.citizenRequest.id,
        senderId: req.user.sub,
        body: req.body.body
      }
    });
    await tx.citizenRequestEvent.create({
      data: {
        municipalityId: req.user.municipalityId,
        requestId: req.citizenRequest.id,
        type: 'MESSAGE_ADDED',
        status: req.citizenRequest.status,
        actorId: req.user.sub,
        metadata: { messageId: message.id }
      }
    });
    const recipientId = req.user.sub === req.citizenRequest.citizenId
      ? req.citizenRequest.assignedBy
      : req.citizenRequest.citizenId;
    if (recipientId) {
      await tx.notification.create({
        data: {
          municipalityId: req.user.municipalityId,
          recipientId,
          eventType: 'REQUEST_MESSAGE',
          resourceType: 'CITIZEN_REQUEST',
          resourceId: req.citizenRequest.id,
          title: 'Nouveau message',
          body: 'Un nouveau message a été ajouté à la demande.',
          channels: ['IN_APP']
        }
      });
    }
    return message;
  });
  res.status(201).json(created);
});

module.exports = router;
