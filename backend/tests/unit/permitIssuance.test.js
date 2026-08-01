const appendEventAudit = jest.fn().mockResolvedValue('audit-id');

jest.mock('../../src/services/eventAudit', () => ({ appendEventAudit }));

const {
  buildIssuanceNumber,
  getPermitIssuance,
  issuePermit
} = require('../../src/services/permitIssuance');

function createDb({
  permitStatus = 'APPROVED',
  feeStatus = 'PAID',
  existingIssuance = null,
  permit = undefined,
  requiredDocumentTypes = [],
  documents = []
} = {}) {
  const issuance = {
    id: '44444444-4444-4444-8444-444444444444',
    municipalityId: 7,
    permitId: '33333333-3333-4333-8333-333333333333',
    issuanceNumber: 'CF-7-2026-3333333333'
  };
  const resolvedPermit = permit === undefined ? {
    id: issuance.permitId,
    status: permitStatus,
    subtype: 'CONSTRUCTION',
    details: { requiredDocumentTypes, documents }
  } : permit;
  const tx = {
    roadEvent: { findFirst: jest.fn().mockResolvedValue(resolvedPermit) },
    permitDocumentRequirement: { findUnique: jest.fn().mockResolvedValue(null) },
    $queryRawUnsafe: jest.fn()
      .mockResolvedValueOnce(existingIssuance ? [existingIssuance] : [])
      .mockResolvedValueOnce([{ status: feeStatus }])
      .mockResolvedValueOnce([issuance])
  };
  return {
    issuance,
    tx,
    db: { $transaction: jest.fn((callback) => callback(tx)) }
  };
}

beforeEach(() => {
  appendEventAudit.mockClear();
});

test('construit un numéro de délivrance municipal stable', () => {
  expect(buildIssuanceNumber(7, new Date('2026-08-01T00:00:00Z'), '33333333-3333-4333-8333-333333333333'))
    .toBe('CF-7-2026-3333333333');
});

test('consulte une délivrance existante ou retourne null', async () => {
  const existing = { id: 'existing' };
  const db = { $queryRawUnsafe: jest.fn().mockResolvedValueOnce([existing]).mockResolvedValueOnce([]) };
  await expect(getPermitIssuance(db, { municipalityId: 7, permitId: 'p1' })).resolves.toEqual(existing);
  await expect(getPermitIssuance(db, { municipalityId: 7, permitId: 'p2' })).resolves.toBeNull();
});

test('délivre un permis approuvé, conforme et payé', async () => {
  const { db, issuance } = createDb();
  await expect(issuePermit(db, {
    municipalityId: 7,
    permitId: issuance.permitId,
    actorId: '11111111-1111-4111-8111-111111111111',
    actorRole: 'MANAGER'
  })).resolves.toMatchObject({ permitId: issuance.permitId, issuanceNumber: issuance.issuanceNumber });
  expect(appendEventAudit).toHaveBeenCalledWith(expect.objectContaining({
    eventId: issuance.permitId,
    municipalityId: 7,
    action: 'PERMIT_ISSUED',
    actorRole: 'MANAGER',
    metadata: expect.objectContaining({ feeStatus: 'PAID' })
  }));
});

test('accepte aussi une dispense de frais', async () => {
  const { db, issuance } = createDb({ feeStatus: 'WAIVED' });
  await expect(issuePermit(db, {
    municipalityId: 7,
    permitId: issuance.permitId,
    actorId: '11111111-1111-4111-8111-111111111111',
    actorRole: 'ADMIN'
  })).resolves.toMatchObject({ permitId: issuance.permitId });
  expect(appendEventAudit).toHaveBeenCalledWith(expect.objectContaining({
    metadata: expect.objectContaining({ feeStatus: 'WAIVED' })
  }));
});

test('retourne la délivrance existante de façon idempotente', async () => {
  const existing = { id: 'existing', issuanceNumber: 'CF-7-2026-EXISTING' };
  const { db, tx } = createDb({ existingIssuance: existing });
  await expect(issuePermit(db, {
    municipalityId: 7,
    permitId: '33333333-3333-4333-8333-333333333333',
    actorId: '11111111-1111-4111-8111-111111111111',
    actorRole: 'ADMIN'
  })).resolves.toEqual(existing);
  expect(tx.$queryRawUnsafe).toHaveBeenCalledTimes(1);
  expect(appendEventAudit).not.toHaveBeenCalled();
});

test('bloque un permis introuvable', async () => {
  const { db } = createDb({ permit: null });
  await expect(issuePermit(db, {
    municipalityId: 7,
    permitId: '33333333-3333-4333-8333-333333333333',
    actorId: '11111111-1111-4111-8111-111111111111',
    actorRole: 'MANAGER'
  })).rejects.toMatchObject({ code: 'PERMIT_NOT_FOUND' });
});

test('bloque un permis non approuvé', async () => {
  const { db } = createDb({ permitStatus: 'SUBMITTED' });
  await expect(issuePermit(db, {
    municipalityId: 7,
    permitId: '33333333-3333-4333-8333-333333333333',
    actorId: '11111111-1111-4111-8111-111111111111',
    actorRole: 'MANAGER'
  })).rejects.toMatchObject({ code: 'PERMIT_NOT_APPROVED' });
});

test('bloque les pièces obligatoires non acceptées', async () => {
  const { db } = createDb({ requiredDocumentTypes: ['PLAN'], documents: [] });
  await expect(issuePermit(db, {
    municipalityId: 7,
    permitId: '33333333-3333-4333-8333-333333333333',
    actorId: '11111111-1111-4111-8111-111111111111',
    actorRole: 'MANAGER'
  })).rejects.toMatchObject({
    code: 'PERMIT_DOCUMENTS_INCOMPLETE',
    compliance: expect.objectContaining({ missingTypes: ['PLAN'] })
  });
});

test.each([null, 'DUE'])('bloque les frais non réglés (%s)', async (feeStatus) => {
  const { db, tx } = createDb({ feeStatus: feeStatus || 'DUE' });
  if (feeStatus === null) tx.$queryRawUnsafe.mockReset()
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([]);
  await expect(issuePermit(db, {
    municipalityId: 7,
    permitId: '33333333-3333-4333-8333-333333333333',
    actorId: '11111111-1111-4111-8111-111111111111',
    actorRole: 'MANAGER'
  })).rejects.toMatchObject({ code: 'PERMIT_FEE_UNSETTLED' });
});
