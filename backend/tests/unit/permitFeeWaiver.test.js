const { waivePermitFee } = require('../../src/services/permitFeeWaiver');

const municipalityId = 7;
const permitId = '33333333-3333-4333-8333-333333333333';
const actorId = '11111111-1111-4111-8111-111111111111';

function createDb(existing) {
  return {
    roadEvent: { findFirst: jest.fn().mockResolvedValue({ id: permitId }) },
    $queryRawUnsafe: jest.fn()
      .mockResolvedValueOnce(existing ? [existing] : [])
      .mockResolvedValueOnce([{ ...existing, status: 'WAIVED', waivedReason: 'Programme municipal admissible' }])
  };
}

test('dispense un frais avec motif et auteur', async () => {
  const db = createDb({ permitId, status: 'DUE' });
  await expect(waivePermitFee(db, { municipalityId, permitId, actorId, reason: 'Programme municipal admissible' }))
    .resolves.toMatchObject({ status: 'WAIVED', waivedReason: 'Programme municipal admissible' });
  expect(db.$queryRawUnsafe).toHaveBeenCalledTimes(2);
});

test('rend la même dispense idempotente', async () => {
  const existing = { permitId, status: 'WAIVED', waivedReason: 'Programme municipal admissible' };
  const db = createDb(existing);
  await expect(waivePermitFee(db, { municipalityId, permitId, actorId, reason: existing.waivedReason })).resolves.toEqual(existing);
  expect(db.$queryRawUnsafe).toHaveBeenCalledTimes(1);
});

test('refuse de dispenser un frais déjà payé', async () => {
  const db = createDb({ permitId, status: 'PAID' });
  await expect(waivePermitFee(db, { municipalityId, permitId, actorId, reason: 'Programme municipal admissible' }))
    .rejects.toMatchObject({ code: 'PERMIT_FEE_ALREADY_PAID' });
});

test('refuse la dispense sans frais établi', async () => {
  const db = createDb(null);
  await expect(waivePermitFee(db, { municipalityId, permitId, actorId, reason: 'Programme municipal admissible' }))
    .rejects.toMatchObject({ code: 'PERMIT_FEE_NOT_FOUND' });
});

test('isole le permis par municipalité', async () => {
  const db = createDb({ permitId, status: 'DUE' });
  db.roadEvent.findFirst.mockResolvedValue(null);
  await expect(waivePermitFee(db, { municipalityId, permitId, actorId, reason: 'Programme municipal admissible' }))
    .rejects.toMatchObject({ code: 'PERMIT_NOT_FOUND' });
});
