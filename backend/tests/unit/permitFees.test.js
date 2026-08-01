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
  const db = createDb();
  db.$queryRawUnsafe.mockResolvedValue([]);

  await expect(getPermitFee(db, { municipalityId, permitId })).resolves.toBeNull();
  expect(db.roadEvent.findFirst).toHaveBeenCalledWith({
    where: { id: permitId, municipalityId, sourceType: 'PERMIT' },
    select: { id: true, status: true }
  });
  expect(db.$queryRawUnsafe).toHaveBeenCalledWith(
    expect.stringContaining('FROM "PermitFee"'),
    municipalityId,
    permitId
  );
});

test('établit un frais en cents avec devise', async () => {
  const db = createDb();
  const fee = { permitId, amountCents: 12500, currency: 'CAD', status: 'DUE' };
  db.$queryRawUnsafe.mockResolvedValue([fee]);

  await expect(assessPermitFee(db, {
    municipalityId,
    permitId,
    amountCents: 12500,
    currency: 'CAD',
    actorId
  })).resolves.toEqual(fee);

  expect(db.$queryRawUnsafe).toHaveBeenCalledWith(
    expect.stringContaining('INSERT INTO "PermitFee"'),
    municipalityId,
    permitId,
    12500,
    'CAD',
    null,
    actorId
  );
});

test('applique les valeurs par défaut lors de l’établissement', async () => {
  const db = createDb();
  const fee = { permitId, amountCents: 5000, currency: 'CAD', status: 'DUE' };
  db.$queryRawUnsafe.mockResolvedValue([fee]);

  await expect(assessPermitFee(db, {
    municipalityId,
    permitId,
    amountCents: 5000,
    actorId
  })).resolves.toEqual(fee);

  expect(db.$queryRawUnsafe).toHaveBeenCalledWith(
    expect.any(String),
    municipalityId,
    permitId,
    5000,
    'CAD',
    null,
    actorId
  );
});

test('rend le marquage payé idempotent pour la même référence', async () => {
  const db = createDb();
  const fee = { permitId, status: 'PAID', paymentReference: 'PAY-001' };
  db.$queryRawUnsafe.mockResolvedValue([fee]);

  await expect(markPermitFeePaid(db, {
    municipalityId,
    permitId,
    paymentReference: 'PAY-001',
    actorId
  })).resolves.toEqual(fee);

  expect(db.$queryRawUnsafe).toHaveBeenCalledTimes(1);
});

test('refuse une seconde référence de paiement', async () => {
  const db = createDb();
  db.$queryRawUnsafe.mockResolvedValue([{ permitId, status: 'PAID', paymentReference: 'PAY-001' }]);

  await expect(markPermitFeePaid(db, {
    municipalityId,
    permitId,
    paymentReference: 'PAY-002',
    actorId
  })).rejects.toMatchObject({ code: 'PERMIT_FEE_ALREADY_PAID' });
});

test('refuse le paiement lorsqu’aucun frais n’est établi', async () => {
  const db = createDb();
  db.$queryRawUnsafe.mockResolvedValue([]);

  await expect(markPermitFeePaid(db, {
    municipalityId,
    permitId,
    paymentReference: 'PAY-003',
    actorId
  })).rejects.toMatchObject({ code: 'PERMIT_FEE_NOT_FOUND' });

  expect(db.$queryRawUnsafe).toHaveBeenCalledTimes(1);
});

test('enregistre un paiement avec sa date explicite', async () => {
  const db = createDb();
  const existing = { permitId, status: 'DUE', paymentReference: null };
  const paid = { ...existing, status: 'PAID', paymentReference: 'PAY-004' };
  db.$queryRawUnsafe
    .mockResolvedValueOnce([existing])
    .mockResolvedValueOnce([paid]);

  await expect(markPermitFeePaid(db, {
    municipalityId,
    permitId,
    paymentReference: 'PAY-004',
    paidAt: '2026-08-01T20:00:00.000Z',
    actorId
  })).resolves.toEqual(paid);

  expect(db.$queryRawUnsafe).toHaveBeenNthCalledWith(
    2,
    expect.stringContaining('UPDATE "PermitFee"'),
    'PAY-004',
    actorId,
    '2026-08-01T20:00:00.000Z',
    municipalityId,
    permitId
  );
});

test('laisse la base choisir la date lorsque paidAt est absent', async () => {
  const db = createDb();
  const existing = { permitId, status: 'DUE', paymentReference: null };
  const paid = { ...existing, status: 'PAID', paymentReference: 'PAY-005' };
  db.$queryRawUnsafe
    .mockResolvedValueOnce([existing])
    .mockResolvedValueOnce([paid]);

  await expect(markPermitFeePaid(db, {
    municipalityId,
    permitId,
    paymentReference: 'PAY-005',
    actorId
  })).resolves.toEqual(paid);

  expect(db.$queryRawUnsafe).toHaveBeenNthCalledWith(
    2,
    expect.stringContaining('COALESCE($3::timestamptz, CURRENT_TIMESTAMP)'),
    'PAY-005',
    actorId,
    null,
    municipalityId,
    permitId
  );
});

test('isole strictement le permis par municipalité', async () => {
  const db = createDb();
  db.roadEvent.findFirst.mockResolvedValue(null);

  await expect(getPermitFee(db, { municipalityId, permitId }))
    .rejects.toMatchObject({ code: 'PERMIT_NOT_FOUND' });

  expect(db.$queryRawUnsafe).not.toHaveBeenCalled();
});
