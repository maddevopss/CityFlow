const { appendEventAudit } = require('./eventAudit');
const { assertPermitDocumentCompliance } = require('./permitDocumentCompliance');

const TRANSITIONS = {
  submit: { from: ['DRAFT', 'REJECTED'], to: 'SUBMITTED', action: 'SUBMITTED' },
  approve: { from: ['SUBMITTED'], to: 'APPROVED', action: 'APPROVED' },
  reject: { from: ['SUBMITTED'], to: 'REJECTED', action: 'REJECTED', reasonRequired: true },
  close: { from: ['APPROVED', 'ACTIVE'], to: 'CLOSED', action: 'CLOSED', reasonRequired: true }
};

function buildTransitionData(action, actorId, reason, now = new Date()) {
  const data = { statusReason: reason || null };
  if (action === 'submit') Object.assign(data, { submittedBy: actorId, submittedAt: now });
  if (action === 'approve') Object.assign(data, { approvedBy: actorId, approvedAt: now });
  if (action === 'close') Object.assign(data, { closedBy: actorId, closedAt: now });
  return data;
}

async function transitionPermit(db, { permitId, municipalityId, action, actorId, actorRole, reason = null, now = new Date() }) {
  const rule = TRANSITIONS[action];
  if (!rule) {
    const error = new Error('Transition de permis inconnue');
    error.code = 'PERMIT_TRANSITION_UNKNOWN';
    throw error;
  }
  if (rule.reasonRequired && (!reason || reason.trim().length < 3)) {
    const error = new Error('Un motif d’au moins 3 caractères est requis');
    error.code = 'PERMIT_REASON_REQUIRED';
    throw error;
  }

  return db.$transaction(async (tx) => {
    const permit = await tx.roadEvent.findFirst({
      where: { id: permitId, municipalityId, sourceType: 'PERMIT' }
    });
    if (!permit) {
      const error = new Error('Permis introuvable');
      error.code = 'PERMIT_NOT_FOUND';
      throw error;
    }
    if (!rule.from.includes(permit.status)) {
      const error = new Error(`Transition impossible de ${permit.status} vers ${rule.to}`);
      error.code = 'PERMIT_TRANSITION_CONFLICT';
      error.currentStatus = permit.status;
      error.allowedFrom = rule.from;
      throw error;
    }
    if (action === 'approve') assertPermitDocumentCompliance(permit.details);

    const updated = await tx.roadEvent.update({
      where: { id: permit.id },
      data: {
        status: rule.to,
        ...buildTransitionData(action, actorId, reason ? reason.trim() : null, now)
      }
    });

    await appendEventAudit({
      eventId: updated.id,
      municipalityId: updated.municipalityId,
      action: rule.action,
      actorId,
      actorRole,
      previousStatus: permit.status,
      newStatus: updated.status,
      reason: reason ? reason.trim() : null,
      metadata: { sourceType: 'PERMIT' },
      db: tx
    });

    return updated;
  });
}

module.exports = { TRANSITIONS, buildTransitionData, transitionPermit };
