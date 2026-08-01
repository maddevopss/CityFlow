'use strict';

const LOCK_NAMESPACE = 73021;

class CitizenEscalationAlreadyRunningError extends Error {
  constructor(municipalityId) {
    super('Un cycle d’escalade est déjà en cours pour cette municipalité');
    this.name = 'CitizenEscalationAlreadyRunningError';
    this.code = 'CITIZEN_ESCALATION_ALREADY_RUNNING';
    this.municipalityId = municipalityId;
  }
}

async function executeCitizenEscalationWithLock(db, municipalityId, task) {
  if (!db || typeof db.$transaction !== 'function') {
    return task(db);
  }

  return db.$transaction(async (tx) => {
    const rows = await tx.$queryRawUnsafe(
      'SELECT pg_try_advisory_xact_lock($1, $2) AS acquired',
      LOCK_NAMESPACE,
      municipalityId
    );

    if (!rows?.[0]?.acquired) {
      throw new CitizenEscalationAlreadyRunningError(municipalityId);
    }

    return task(tx);
  });
}

module.exports = {
  LOCK_NAMESPACE,
  CitizenEscalationAlreadyRunningError,
  executeCitizenEscalationWithLock
};
