jest.mock('../../src/services/eventAudit', () => ({ appendEventAudit: jest.fn() }));
const { appendEventAudit } = require('../../src/services/eventAudit');
const { addPermitDocument, reviewPermitDocument, readDocuments } = require('../../src/services/permitDocuments');

function createDb(details = {}) {
  const tx = {
    roadEvent: {
      findFirst: jest.fn().mockResolvedValue({ id: '33333333-3333-4333-8333-333333333333', municipalityId: 7, status: 'DRAFT', details }),
      update: jest.fn().mockResolvedValue({})
    }
  };
  return { db: { $transaction: jest.fn((callback) => callback(tx)) }, tx };
}
const document = { documentType: 'PLAN', fileName: 'plan.pdf', mimeType: 'application/pdf', sizeBytes: 1024, storageKey: 'permits/7/plan.pdf', sha256: 'A'.repeat(64), description: 'Plan du chantier' };

beforeEach(() => jest.clearAllMocks());

test('ajoute une pièce en attente et journalise l’action', async () => {
  const { db, tx } = createDb();
  const result = await addPermitDocument(db, { permitId: 'p1', municipalityId: 7, actorId: 'u1', actorRole: 'MUNICIPAL_AGENT', document, now: new Date('2026-08-01T12:00:00Z') });
  expect(result).toMatchObject({ documentType: 'PLAN', status: 'PENDING', sha256: 'a'.repeat(64) });
  expect(tx.roadEvent.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: '33333333-3333-4333-8333-333333333333' } }));
  expect(appendEventAudit).toHaveBeenCalledWith(expect.objectContaining({ action: 'DOCUMENT_ADDED', municipalityId: 7 }));
});

test('refuse un storageKey déjà présent', async () => {
  const { db } = createDb({ documents: [{ id: 'd1', storageKey: document.storageKey }] });
  await expect(addPermitDocument(db, { permitId: 'p1', municipalityId: 7, actorId: 'u1', actorRole: 'MUNICIPAL_AGENT', document })).rejects.toMatchObject({ code: 'PERMIT_DOCUMENT_DUPLICATE' });
});

test('accepte une pièce et conserve la décision', async () => {
  const existing = { id: '44444444-4444-4444-8444-444444444444', storageKey: 'key', status: 'PENDING', createdAt: '2026-08-01T10:00:00Z' };
  const { db } = createDb({ documents: [existing] });
  const result = await reviewPermitDocument(db, { permitId: 'p1', documentId: existing.id, municipalityId: 7, actorId: 'm1', actorRole: 'MANAGER', status: 'ACCEPTED', now: new Date('2026-08-01T13:00:00Z') });
  expect(result).toMatchObject({ status: 'ACCEPTED', reviewedBy: 'm1' });
  expect(appendEventAudit).toHaveBeenCalledWith(expect.objectContaining({ action: 'DOCUMENT_ACCEPTED' }));
});

test('exige un motif pour refuser une pièce', async () => {
  const { db } = createDb({ documents: [{ id: 'd1', status: 'PENDING' }] });
  await expect(reviewPermitDocument(db, { permitId: 'p1', documentId: 'd1', municipalityId: 7, actorId: 'm1', actorRole: 'MANAGER', status: 'REJECTED', reason: 'x' })).rejects.toMatchObject({ code: 'PERMIT_DOCUMENT_REASON_REQUIRED' });
});

test('normalise les détails sans tableau de documents', () => {
  expect(readDocuments(null)).toEqual([]);
  expect(readDocuments({ documents: 'invalid' })).toEqual([]);
});
