const { randomUUID } = require('crypto');
const { appendEventAudit } = require('./eventAudit');

const DOCUMENT_STATUSES = ['PENDING', 'ACCEPTED', 'REJECTED'];

function normalizeDetails(details) {
  return details && typeof details === 'object' && !Array.isArray(details) ? details : {};
}

function readDocuments(details) {
  const documents = normalizeDetails(details).documents;
  return Array.isArray(documents) ? documents : [];
}

async function findPermit(tx, { permitId, municipalityId }) {
  const permit = await tx.roadEvent.findFirst({
    where: { id: permitId, municipalityId, sourceType: 'PERMIT' },
    select: { id: true, municipalityId: true, status: true, details: true }
  });
  if (!permit) {
    const error = new Error('Permis introuvable');
    error.code = 'PERMIT_NOT_FOUND';
    throw error;
  }
  return permit;
}

async function listPermitDocuments(db, input) {
  const permit = await findPermit(db, input);
  return readDocuments(permit.details).slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

async function addPermitDocument(db, { permitId, municipalityId, actorId, actorRole, document, now = new Date() }) {
  return db.$transaction(async (tx) => {
    const permit = await findPermit(tx, { permitId, municipalityId });
    const details = normalizeDetails(permit.details);
    const documents = readDocuments(details);
    if (documents.some((item) => item.storageKey === document.storageKey)) {
      const error = new Error('Cette pièce est déjà rattachée au permis');
      error.code = 'PERMIT_DOCUMENT_DUPLICATE';
      throw error;
    }
    const created = {
      id: randomUUID(),
      documentType: document.documentType,
      fileName: document.fileName,
      mimeType: document.mimeType,
      sizeBytes: document.sizeBytes,
      storageKey: document.storageKey,
      sha256: document.sha256.toLowerCase(),
      description: document.description || null,
      status: 'PENDING',
      uploadedBy: actorId,
      createdAt: now.toISOString(),
      reviewedBy: null,
      reviewedAt: null,
      reviewReason: null
    };
    await tx.roadEvent.update({ where: { id: permit.id }, data: { details: { ...details, documents: [...documents, created] } } });
    await appendEventAudit({ eventId: permit.id, municipalityId, action: 'DOCUMENT_ADDED', actorId, actorRole, previousStatus: permit.status, newStatus: permit.status, metadata: { documentId: created.id, documentType: created.documentType }, db: tx });
    return created;
  });
}

async function reviewPermitDocument(db, { permitId, documentId, municipalityId, actorId, actorRole, status, reason = null, now = new Date() }) {
  if (!DOCUMENT_STATUSES.includes(status) || status === 'PENDING') {
    const error = new Error('Décision de pièce invalide');
    error.code = 'PERMIT_DOCUMENT_REVIEW_INVALID';
    throw error;
  }
  if (status === 'REJECTED' && (!reason || reason.trim().length < 3)) {
    const error = new Error('Un motif est requis pour refuser une pièce');
    error.code = 'PERMIT_DOCUMENT_REASON_REQUIRED';
    throw error;
  }
  return db.$transaction(async (tx) => {
    const permit = await findPermit(tx, { permitId, municipalityId });
    const details = normalizeDetails(permit.details);
    const documents = readDocuments(details);
    const index = documents.findIndex((item) => item.id === documentId);
    if (index < 0) {
      const error = new Error('Pièce justificative introuvable');
      error.code = 'PERMIT_DOCUMENT_NOT_FOUND';
      throw error;
    }
    const reviewed = { ...documents[index], status, reviewedBy: actorId, reviewedAt: now.toISOString(), reviewReason: reason ? reason.trim() : null };
    const next = documents.slice();
    next[index] = reviewed;
    await tx.roadEvent.update({ where: { id: permit.id }, data: { details: { ...details, documents: next } } });
    await appendEventAudit({ eventId: permit.id, municipalityId, action: status === 'ACCEPTED' ? 'DOCUMENT_ACCEPTED' : 'DOCUMENT_REJECTED', actorId, actorRole, previousStatus: permit.status, newStatus: permit.status, reason: reviewed.reviewReason, metadata: { documentId }, db: tx });
    return reviewed;
  });
}

module.exports = { DOCUMENT_STATUSES, readDocuments, listPermitDocuments, addPermitDocument, reviewPermitDocument };
