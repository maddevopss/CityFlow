const { getPermitFee, assessPermitFee, markPermitFeePaid } = require('../../src/services/permitFees');

const municipalityId = 7;
const permitId = '33333333-3333-4333-8333-333333333333';
const actorId = '11111111-1111-4111-8111-111111111111';

function createDb() {
  return {
    roadEvent: { findFirst: jest.fn().mockResolvedValue({ id: permitId, status: 'SUBMITTED' }) },
    $queryRawUnsafe: jest.fn()
  };
}

test('retourne null lorsqu’aucun frais n’est établi', async () => {
  const db = createDb(); db.$queryRawUnsafe.mockResolvedValue([]);
  await expect(getPermitFee(db, { municipalityId, permitId })).resolves.toBeNull();
});

test('établit un frais en cents avec devise', async () => {
  const db = createDb(); const fee = { permitId, amountCents: 12500, currency: 'CAD', status: 'DUE' };
  db.$queryRawUnsafe.mockResolvedValue([fee]);
  await expect(assessPermitFee(db, { municipalityId, permitId, amountCents: 12500, currency: 'CAD', actorId })).resolves.toEqual(fee);
});

test('rend le marquage payé idempotent pour la même référence', async () => {
  const db = createDb(); const fee = { permitId, status: 'PAID', paymentReference: 'PAY-001' };
  db.$queryRawUnsafe.mockResolvedValue([fee]);
  await expect(markPermitFeePaid(db, { municipalityId, permitId, paymentReference: 'PAY-001', actorId })).resolves.toEqual(fee);
  expect(db.$queryRawUnsafe).toHaveBeenCalledTimes(1);
});

test('refuse une seconde référence de paiement', async () => {
  const db = createDb(); db.$queryRawUnsafe.mockResolvedValue([{ permitId, status: 'PAID', paymentReference: 'PAY-001' }]);
  await expect(markPermitFeePaid(db, { municipalityId, permitId, paymentReference: 'PAY-002', actorId })).rejects.toMatchObject({ code: 'PERMIT_FEE_ALREADY_PAID' });
});

test('isole strictement le permis par municipalité', async () => {
  const db = createDb(); db.roadEvent.findFirst.mockResolvedValue(null);
  await expect(getPermitFee(db, { municipalityId, permitId })).rejects.toMatchObject({ code: 'PERMIT_NOT_FOUND' });
});
