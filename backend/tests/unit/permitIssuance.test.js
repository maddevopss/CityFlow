const { buildIssuanceNumber, issuePermit } = require('../../src/services/permitIssuance');

function createDb({ permitStatus = 'APPROVED', feeStatus = 'PAID', existingIssuance = null } = {}) {
  const issuance = {
    id: '44444444-4444-4444-8444-444444444444',
    municipalityId: 7,
    permitId: '33333333-3333-4333-8333-333333333333',
    issuanceNumber: 'CF-7-2026-3333333333'
  };
  const tx = {
    roadEvent: {
      findFirst: jest.fn().mockResolvedValue({
        id: issuance.permitId,
        status: permitStatus,
        subtype: 'CONSTRUCTION',
        details: { requiredDocumentTypes: [], documents: [] }
      })
    },
    permitDocumentRequirement: { findUnique: jest.fn().mockResolvedValue(null) },
    $queryRawUnsafe: jest.fn()
      .mockResolvedValueOnce(existingIssuance ? [existingIssuance] : [])
      .mockResolvedValueOnce([{ status: feeStatus }])
      .mockResolvedValueOnce([issuance]),
    $executeRaw: jest.fn().mockResolvedValue(1)
  };
  return {
    issuance,
    tx,
    db: { $transaction: jest.fn((callback) => callback(tx)) }
  };
}

test('construit un numéro de délivrance municipal stable', () => {
  expect(buildIssuanceNumber(7, new Date('2026-08-01T00:00:00Z'), '33333333-3333-4333-8333-333333333333'))
    .toBe('CF-7-2026-3333333333');
});

test('délivre un permis approuvé, conforme et payé', async () => {
  const { db, tx, issuance } = createDb();
  await expect(issuePermit(db, {
    municipalityId: 7,
    permitId: issuance.permitId,
    actorId: '11111111-1111-4111-8111-111111111111',
    actorRole: 'MANAGER'
  })).resolves.toMatchObject({ permitId: issuance.permitId, issuanceNumber: issuance.issuanceNumber });
  expect(tx.$executeRaw).toHaveBeenCalledTimes(1);
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

test('bloque les frais non réglés', async () => {
  const { db } = createDb({ feeStatus: 'DUE' });
  await expect(issuePermit(db, {
    municipalityId: 7,
    permitId: '33333333-3333-4333-8333-333333333333',
    actorId: '11111111-1111-4111-8111-111111111111',
    actorRole: 'MANAGER'
  })).rejects.toMatchObject({ code: 'PERMIT_FEE_UNSETTLED' });
});
