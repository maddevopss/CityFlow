'use strict';

const { evaluateCitizenRequestServiceLevel } = require('./citizenRequestServiceLevels');

const ESCALATION_LEVELS = new Set(['AT_RISK', 'BREACHED']);
const EVENT_TYPE_BY_LEVEL = {
  AT_RISK: 'CITIZEN_REQUEST_AT_RISK',
  BREACHED: 'CITIZEN_REQUEST_BREACHED'
};
const RECIPIENT_ROLES = ['ADMIN', 'MANAGER', 'MUNICIPAL_AGENT'];
const OPEN_STATUSES = ['SUBMITTED', 'ACKNOWLEDGED', 'IN_REVIEW', 'PLANNED', 'IN_PROGRESS'];

function notificationBody(request, serviceLevel) {
  if (serviceLevel.level === 'BREACHED') {
    return `La demande « ${request.title} » dépasse sa cible de ${Math.abs(serviceLevel.hoursRemaining)} heure(s).`;
  }
  return `La demande « ${request.title} » atteindra sa cible dans ${serviceLevel.hoursRemaining} heure(s).`;
}

async function escalateCitizenRequestServiceLevels(db, municipalityId, now = new Date()) {
  if (!Number.isInteger(municipalityId) || municipalityId <= 0) {
    throw new Error('municipalityId required');
  }

  const requests = await db.citizenRequest.findMany({
    where: { municipalityId, status: { in: OPEN_STATUSES } },
    select: { id: true, title: true, category: true, status: true, createdAt: true }
  });

  const candidates = requests
    .map((request) => evaluateCitizenRequestServiceLevel(request, now))
    .filter((request) => ESCALATION_LEVELS.has(request.serviceLevel.level));

  if (!candidates.length) {
    return { scanned: requests.length, candidates: 0, created: 0 };
  }

  const recipients = await db.user.findMany({
    where: { municipalityId, isActive: true, role: { in: RECIPIENT_ROLES } },
    select: { id: true }
  });

  if (!recipients.length) {
    return { scanned: requests.length, candidates: candidates.length, created: 0 };
  }

  const requestIds = candidates.map((request) => request.id);
  const eventTypes = [...new Set(candidates.map((request) => EVENT_TYPE_BY_LEVEL[request.serviceLevel.level]))];
  const existing = await db.notification.findMany({
    where: {
      municipalityId,
      requestId: { in: requestIds },
      eventType: { in: eventTypes },
      recipientId: { in: recipients.map((recipient) => recipient.id) }
    },
    select: { requestId: true, eventType: true, recipientId: true }
  });
  const dedupe = new Set(existing.map((item) => `${item.requestId}:${item.eventType}:${item.recipientId}`));

  const data = candidates.flatMap((request) => {
    const eventType = EVENT_TYPE_BY_LEVEL[request.serviceLevel.level];
    return recipients
      .filter((recipient) => !dedupe.has(`${request.id}:${eventType}:${recipient.id}`))
      .map((recipient) => ({
        municipalityId,
        recipientId: recipient.id,
        requestId: request.id,
        eventType,
        channel: 'IN_APP',
        subject: request.serviceLevel.level === 'BREACHED'
          ? 'Délai citoyen dépassé'
          : 'Délai citoyen à risque',
        body: notificationBody(request, request.serviceLevel),
        status: 'PENDING'
      }));
  });

  if (data.length) {
    await db.notification.createMany({ data });
  }

  return { scanned: requests.length, candidates: candidates.length, created: data.length };
}

module.exports = {
  EVENT_TYPE_BY_LEVEL,
  RECIPIENT_ROLES,
  escalateCitizenRequestServiceLevels
};
