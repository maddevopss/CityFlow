const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  user: {
    findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve({
      id: where.id,
      role: where.id === '55555555-5555-4555-8555-555555555555' ? 'VIEWER' : 'MANAGER',
      municipalityId: where.id === '66666666-6666-4666-8666-666666666666' ? null : 7,
      isActive: true
    }))
  }
}));
jest.mock('../../src/services/permitIssuance', () => ({
  getPermitIssuance: jest.fn(),
  issuePermit: jest.fn()
}));

const { getPermitIssuance, issuePermit } = require('../../src/services/permitIssuance');
const app = require('../../src/app');
const config = require('../../src/config');

const permitId = '33333333-3333-4333-8333-333333333333';
const issuance = {
  id: '44444444-4444-4444-8444-444444444444',
  permitId,
  municipalityId: 7,
  issuanceNumber: 'CF-7-2026-3333333333'
};

function token(role, municipalityId = 7) {
  return jwt.sign({
    sub: role === 'VIEWER' ? '55555555-5555-4555-8555-555555555555' : '22222222-2222-4222-8222-222222222222',
    role,
    municipalityId
  }, config.jwtSecret);
}

const managerToken = token('MANAGER');
const viewerToken = token('VIEWER');
const noMunicipalityToken = jwt.sign({
  sub: '66666666-6666-4666-8666-666666666666',
  role: 'MANAGER'
}, config.jwtSecret);

beforeEach(() => {
  jest.clearAllMocks();
});

test('consulte la délivrance officielle d’un permis', async () => {
  getPermitIssuance.mockResolvedValue(issuance);

  const response = await request(app)
    .get(`/api/v1/permits/${permitId}/issuance`)
    .set('Authorization', `Bearer ${viewerToken}`);

  expect(response.status).toBe(200);
  expect(response.body.issuance).toEqual(issuance);
  expect(getPermitIssuance).toHaveBeenCalledWith(expect.anything(), {
    municipalityId: 7,
    permitId
  });
});

test('retourne une délivrance absente sans fabriquer de résultat', async () => {
  getPermitIssuance.mockResolvedValue(null);

  const response = await request(app)
    .get(`/api/v1/permits/${permitId}/issuance`)
    .set('Authorization', `Bearer ${viewerToken}`);

  expect(response.status).toBe(200);
  expect(response.body.issuance).toBeNull();
});

test('refuse un identifiant de permis invalide en lecture', async () => {
  const response = await request(app)
    .get('/api/v1/permits/invalide/issuance')
    .set('Authorization', `Bearer ${viewerToken}`);

  expect(response.status).toBe(400);
  expect(getPermitIssuance).not.toHaveBeenCalled();
});

test('exige une municipalité en lecture', async () => {
  const response = await request(app)
    .get(`/api/v1/permits/${permitId}/issuance`)
    .set('Authorization', `Bearer ${noMunicipalityToken}`);

  expect(response.status).toBe(401);
  expect(getPermitIssuance).not.toHaveBeenCalled();
});

test('délivre officiellement un permis admissible', async () => {
  issuePermit.mockResolvedValue(issuance);

  const response = await request(app)
    .post(`/api/v1/permits/${permitId}/issuance`)
    .set('Authorization', `Bearer ${managerToken}`);

  expect(response.status).toBe(201);
  expect(response.body.issuance).toEqual(issuance);
  expect(issuePermit).toHaveBeenCalledWith(expect.anything(), {
    municipalityId: 7,
    permitId,
    actorId: '22222222-2222-4222-8222-222222222222',
    actorRole: 'MANAGER'
  });
});

test('refuse un identifiant de permis invalide en écriture', async () => {
  const response = await request(app)
    .post('/api/v1/permits/invalide/issuance')
    .set('Authorization', `Bearer ${managerToken}`);

  expect(response.status).toBe(400);
  expect(issuePermit).not.toHaveBeenCalled();
});

test('interdit la délivrance aux rôles en lecture seule', async () => {
  const response = await request(app)
    .post(`/api/v1/permits/${permitId}/issuance`)
    .set('Authorization', `Bearer ${viewerToken}`);

  expect(response.status).toBe(403);
  expect(issuePermit).not.toHaveBeenCalled();
});

test('exige une municipalité en écriture', async () => {
  const response = await request(app)
    .post(`/api/v1/permits/${permitId}/issuance`)
    .set('Authorization', `Bearer ${noMunicipalityToken}`);

  expect(response.status).toBe(401);
  expect(issuePermit).not.toHaveBeenCalled();
});

test('mappe un permis introuvable en 404', async () => {
  issuePermit.mockRejectedValue(Object.assign(new Error('Permis introuvable'), {
    code: 'PERMIT_NOT_FOUND'
  }));

  const response = await request(app)
    .post(`/api/v1/permits/${permitId}/issuance`)
    .set('Authorization', `Bearer ${managerToken}`);

  expect(response.status).toBe(404);
  expect(response.body.code).toBe('PERMIT_NOT_FOUND');
});

test.each([
  ['PERMIT_NOT_APPROVED', undefined],
  ['PERMIT_DOCUMENTS_INCOMPLETE', { compliant: false, missingTypes: ['PLAN'] }],
  ['PERMIT_FEE_UNSETTLED', undefined]
])('mappe %s en conflit', async (code, compliance) => {
  issuePermit.mockRejectedValue(Object.assign(new Error('Conflit de délivrance'), {
    code,
    compliance
  }));

  const response = await request(app)
    .post(`/api/v1/permits/${permitId}/issuance`)
    .set('Authorization', `Bearer ${managerToken}`);

  expect(response.status).toBe(409);
  expect(response.body.code).toBe(code);
  if (compliance) expect(response.body.compliance).toEqual(compliance);
});

test('transmet une erreur inconnue au gestionnaire global', async () => {
  issuePermit.mockRejectedValue(new Error('base indisponible'));

  const response = await request(app)
    .post(`/api/v1/permits/${permitId}/issuance`)
    .set('Authorization', `Bearer ${managerToken}`);

  expect(response.status).toBe(500);
});
