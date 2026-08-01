'use strict';

const VISIBLE_STATUSES = new Set(['SUBMITTED', 'ACKNOWLEDGED', 'IN_REVIEW', 'PLANNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);
const TRANSITIONS = {
  SUBMITTED: ['ACKNOWLEDGED'],
  ACKNOWLEDGED: ['IN_REVIEW'],
  IN_REVIEW: ['PLANNED', 'RESOLVED'],
  PLANNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: []
};

function normalizeCitizenRequest(input, actor) {
  if (!actor?.id || !actor?.municipalityId) throw new Error('citizen context required');
  const title = String(input?.title || '').trim();
  const description = String(input?.description || '').trim();
  if (title.length < 5 || title.length > 140) throw new Error('invalid title');
  if (description.length < 10 || description.length > 5000) throw new Error('invalid description');
  const attachments = Array.isArray(input.attachments) ? input.attachments : [];
  if (attachments.length > 10) throw new Error('too many attachments');
  return {
    municipalityId: actor.municipalityId,
    citizenId: actor.id,
    title,
    description,
    category: String(input.category || 'OTHER').toUpperCase(),
    location: input.location || null,
    attachments: attachments.map(item => ({
      fileName: String(item.fileName || '').slice(0, 255),
      mimeType: String(item.mimeType || 'application/octet-stream'),
      sizeBytes: Number(item.sizeBytes || 0),
      storageKey: String(item.storageKey || '')
    })),
    status: 'SUBMITTED'
  };
}

function assertCitizenOwnership(request, actor) {
  if (!request || request.municipalityId !== actor?.municipalityId || request.citizenId !== actor?.id) {
    const error = new Error('request not found');
    error.status = 404;
    throw error;
  }
}

function transitionCitizenRequest(request, nextStatus, actor) {
  const normalized = String(nextStatus || '').toUpperCase();
  if (!VISIBLE_STATUSES.has(normalized)) throw new Error('invalid status');
  const allowed = TRANSITIONS[request.status] || [];
  if (!allowed.includes(normalized)) {
    const error = new Error(`invalid transition ${request.status} -> ${normalized}`);
    error.status = 409;
    throw error;
  }
  return { ...request, status: normalized, statusChangedAt: new Date().toISOString(), statusChangedBy: actor?.id || null };
}

function citizenTimeline(request) {
  const events = (request.events || [])
    .filter(Boolean)
    .map(event => ({
      id: event.id,
      type: event.eventType,
      status: event.toStatus || event.fromStatus || null,
      createdAt: event.createdAt,
      metadata: event.metadata || null
    }))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const messages = (request.messages || [])
    .filter(Boolean)
    .map(message => ({
      id: message.id,
      body: message.body,
      senderId: message.authorId,
      visibility: message.visibility,
      createdAt: message.createdAt
    }))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const { events: ignoredEvents, messages: ignoredMessages, ...safeRequest } = request;
  return { request: safeRequest, events, messages };
}

module.exports = { VISIBLE_STATUSES, normalizeCitizenRequest, assertCitizenOwnership, transitionCitizenRequest, citizenTimeline };
