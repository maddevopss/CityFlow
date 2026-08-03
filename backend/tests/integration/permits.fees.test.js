const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  user: {
    findUnique: jest.fn().mockResolvedValue({ isActive: true })
  },
  user: {
    findUnique: jest.fn().mockResolvedValue({ isActive: true })
  }
}));
jest.mock('../../src/services/permitFees', () => ({
  getPermitFee: jest.fn(),
  assessPermitFee: jest.fn(),
  markPermitFeePaid: jest.fn()
}));
jest.mock('../../src/services/permitFeeWaiver', () => ({
  waivePermitFee: jest.fn()
}));

const {
  getPermitFee,
  assessPermitFee,
  markPermitFeePaid
} = require('../../src/services/permitFees');
const { waivePermitFee } = require('../../src/services/permitFeeWaiver');
const app = require('../../src/app');
const config = require('../../src/config');

const permitId = '33333333-3333-4333-8333-333333333333';
const actorId = '22222222-2222-4222-8222-222222222222';
const fee = {
  permitId,
  municipalityId: 7,
  amountCents: 12550,
  currency: 'CAD',
  status: 'PENDING'
};

function token(role, municipalityId = 7) {
  return jwt.sign({ sub: actorId, role, municipalityId }, config.jwtSecret);
}

const adminToken = token('ADMIN');
const managerToken = token('MANAGER');
const viewerToken = token('VIEWER');
const noMunicipalityToken = jwt.sign({ sub: actorId, role: 'MANAGER' }, config.jwtSecret);

beforeEach(() => {
  jest.clearAllMocks();
});

test('consulte les frais d’un permis', async () => {
  getPermitFee.mockResolvedValue(fee);

  const response = await request(app)
    .get(`/api/v1/permits/${permitId}/fees`)
    .set('Authorization', `Bearer ${viewerToken}`);

  expect(response.status).toBe(200);
  expect(response.body.fee).toEqual(fee);
  expect(getPermitFee).toHaveBeenCalledWith(expect.anything(), {
    municipalityId: 7,
    permitId
  });
});

test('refuse un identifiant invalide en lecture', async () => {
  const response = await request(app)
    .get('/api/v1/permits/invalide/fees')
    .set('Authorization', `Bearer ${viewerToken}`);

  expect(response.status).toBe(400);
  expect(getPermitFee).not.toHaveBeenCalled();
});

test('exige une municipalité en lecture', async () => {
  const response = await request(app)
    .get(`/api/v1/permits/${permitId}/fees`)
    .set('Authorization', `Bearer ${noMunicipalityToken}`);

  expect(response.status).toBe(403);
  expect(getPermitFee).not.toHaveBeenCalled();
});

test('mappe un frais introuvable en 404', async () => {
  getPermitFee.mockRejectedValue(Object.assign(new Error('Frais introuvable'), {
    code: 'PERMIT_FEE_NOT_FOUND'
  }));

  const response = await request(app)
    .get(`/api/v1/permits/${permitId}/fees`)
    .set('Authorization', `Bearer ${viewerToken}`);

  expect(response.status).toBe(404);
  expect(response.body.code).toBe('PERMIT_FEE_NOT_FOUND');
});

test('transmet une erreur inconnue de lecture', async () => {
  getPermitFee.mockRejectedValue(new Error('base indisponible'));

  const response = await request(app)
    .get(`/api/v1/permits/${permitId}/fees`)
    .set('Authorization', `Bearer ${viewerToken}`);

  expect(response.status).toBe(500);
});

test('évalue les frais d’un permis', async () => {
  assessPermitFee.mockResolvedValue(fee);

  const response = await request(app)
    .put(`/api/v1/permits/${permitId}/fees`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ amountCents: 12550, currency: 'cad', note: 'Analyse municipale' });

  expect(response.status).toBe(200);
  expect(response.body.fee).toEqual(fee);
  expect(assessPermitFee).toHaveBeenCalledWith(expect.anything(), {
    municipalityId: 7,
    permitId,
    actorId,
    amountCents: 12550,
    currency: 'CAD',
    note: 'Analyse municipale'
  });
});

test('applique CAD par défaut lors de l’évaluation', async () => {
  assessPermitFee.mockResolvedValue(fee);

  const response = await request(app)
    .put(`/api/v1/permits/${permitId}/fees`)
    .set('Authorization', `Bearer ${managerToken}`)
    .send({ amountCents: 0 });

  expect(response.status).toBe(200);
  expect(assessPermitFee).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
    amountCents: 0,
    currency: 'CAD'
  }));
});

test('refuse une évaluation invalide', async () => {
  const response = await request(app)
    .put(`/api/v1/permits/${permitId}/fees`)
    .set('Authorization', `Bearer ${managerToken}`)
    .send({ amountCents: -1, currency: 'CA' });

  expect(response.status).toBe(400);
  expect(response.body.details).toHaveLength(2);
  expect(assessPermitFee).not.toHaveBeenCalled();
});

test('interdit l’évaluation à un rôle en lecture seule', async () => {
  const response = await request(app)
    .put(`/api/v1/permits/${permitId}/fees`)
    .set('Authorization', `Bearer ${viewerToken}`)
    .send({ amountCents: 1000 });

  expect(response.status).toBe(403);
  expect(assessPermitFee).not.toHaveBeenCalled();
});

test('exige une municipalité lors de l’évaluation', async () => {
  const response = await request(app)
    .put(`/api/v1/permits/${permitId}/fees`)
    .set('Authorization', `Bearer ${noMunicipalityToken}`)
    .send({ amountCents: 1000 });

  expect(response.status).toBe(403);
  expect(assessPermitFee).not.toHaveBeenCalled();
});

test('mappe un permis introuvable lors de l’évaluation', async () => {
  assessPermitFee.mockRejectedValue(Object.assign(new Error('Permis introuvable'), {
    code: 'PERMIT_NOT_FOUND'
  }));

  const response = await request(app)
    .put(`/api/v1/permits/${permitId}/fees`)
    .set('Authorization', `Bearer ${managerToken}`)
    .send({ amountCents: 1000 });

  expect(response.status).toBe(404);
  expect(response.body.code).toBe('PERMIT_NOT_FOUND');
});

test('constate le paiement d’un permis', async () => {
  const paidFee = { ...fee, status: 'PAID', paymentReference: 'PAY-2026-001' };
  markPermitFeePaid.mockResolvedValue(paidFee);

  const response = await request(app)
    .post(`/api/v1/permits/${permitId}/fees/mark-paid`)
    .set('Authorization', `Bearer ${managerToken}`)
    .send({ paymentReference: 'PAY-2026-001', paidAt: '2026-08-01T20:00:00.000Z' });

  expect(response.status).toBe(200);
  expect(response.body.fee.status).toBe('PAID');
  expect(markPermitFeePaid).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
    municipalityId: 7,
    permitId,
    actorId,
    paymentReference: 'PAY-2026-001'
  }));
});

test('refuse un paiement invalide', async () => {
  const response = await request(app)
    .post(`/api/v1/permits/${permitId}/fees/mark-paid`)
    .set('Authorization', `Bearer ${managerToken}`)
    .send({ paymentReference: 'x', paidAt: 'invalide' });

  expect(response.status).toBe(400);
  expect(response.body.details).toHaveLength(2);
  expect(markPermitFeePaid).not.toHaveBeenCalled();
});

test('mappe un paiement répété en 409', async () => {
  markPermitFeePaid.mockRejectedValue(Object.assign(new Error('Frais déjà payés'), {
    code: 'PERMIT_FEE_ALREADY_PAID'
  }));

  const response = await request(app)
    .post(`/api/v1/permits/${permitId}/fees/mark-paid`)
    .set('Authorization', `Bearer ${managerToken}`)
    .send({ paymentReference: 'PAY-2026-001' });

  expect(response.status).toBe(409);
  expect(response.body.code).toBe('PERMIT_FEE_ALREADY_PAID');
});

test('dispense les frais avec un motif auditable', async () => {
  const waivedFee = { ...fee, status: 'WAIVED', waivedReason: 'Programme municipal admissible' };
  waivePermitFee.mockResolvedValue(waivedFee);

  const response = await request(app)
    .post(`/api/v1/permits/${permitId}/fees/waive`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ reason: 'Programme municipal admissible' });

  expect(response.status).toBe(200);
  expect(response.body.fee.status).toBe('WAIVED');
  expect(waivePermitFee).toHaveBeenCalledWith(expect.anything(), {
    municipalityId: 7,
    permitId,
    actorId,
    reason: 'Programme municipal admissible'
  });
});

test('refuse un motif de dispense trop court', async () => {
  const response = await request(app)
    .post(`/api/v1/permits/${permitId}/fees/waive`)
    .set('Authorization', `Bearer ${managerToken}`)
    .send({ reason: 'Court' });

  expect(response.status).toBe(400);
  expect(waivePermitFee).not.toHaveBeenCalled();
});

test('mappe une dispense répétée en 409', async () => {
  waivePermitFee.mockRejectedValue(Object.assign(new Error('Frais déjà dispensés'), {
    code: 'PERMIT_FEE_ALREADY_WAIVED'
  }));

  const response = await request(app)
    .post(`/api/v1/permits/${permitId}/fees/waive`)
    .set('Authorization', `Bearer ${managerToken}`)
    .send({ reason: 'Programme municipal admissible' });

  expect(response.status).toBe(409);
  expect(response.body.code).toBe('PERMIT_FEE_ALREADY_WAIVED');
});
