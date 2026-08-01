const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  permitDocumentRequirement: { findMany: jest.fn(), upsert: jest.fn() },
  municipality: { findUnique: jest.fn() }
}));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');
const config = require('../../src/config');

const managerToken = jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', municipalityId: 7, role: 'MANAGER' }, config.jwtSecret);
const viewerToken = jwt.sign({ sub: '22222222-2222-4222-8222-222222222222', municipalityId: 7, role: 'VIEWER' }, config.jwtSecret);
const citizenToken = jwt.sign({ sub: '33333333-3333-4333-8333-333333333333', municipalityId: 7, role: 'CITIZEN' }, config.jwtSecret);

beforeEach(() => jest.clearAllMocks());

test('liste les exigences de la municipalité', async () => {
  prisma.permitDocumentRequirement.findMany.mockResolvedValue([{ permitSubtype: 'CONSTRUCTION', requiredDocumentTypes: ['PLAN'] }]);
  const response = await request(app).get('/api/v1/permits/document-requirements').set('Authorization', `Bearer ${viewerToken}`);
  expect(response.status).toBe(200);
  expect(response.body).toHaveLength(1);
  expect(prisma.permitDocumentRequirement.findMany).toHaveBeenCalledWith({ where: { municipalityId: 7 }, orderBy: [{ permitSubtype: 'asc' }] });
});

test('refuse un rôle citoyen', async () => {
  const response = await request(app).get('/api/v1/permits/document-requirements').set('Authorization', `Bearer ${citizenToken}`);
  expect(response.status).toBe(403);
});

test('met à jour les exigences avec un limiteur d’écriture', async () => {
  prisma.permitDocumentRequirement.upsert.mockResolvedValue({ permitSubtype: 'CONSTRUCTION', requiredDocumentTypes: ['PLAN', 'ASSURANCE'] });
  const response = await request(app)
    .put('/api/v1/permits/document-requirements')
    .set('Authorization', `Bearer ${managerToken}`)
    .send({ permitSubtype: ' construction ', requiredDocumentTypes: ['plan', 'ASSURANCE'] });
  expect(response.status).toBe(200);
  expect(response.body.requirement.requiredDocumentTypes).toEqual(['PLAN', 'ASSURANCE']);
});

test('refuse une configuration invalide', async () => {
  const response = await request(app)
    .put('/api/v1/permits/document-requirements')
    .set('Authorization', `Bearer ${managerToken}`)
    .send({ permitSubtype: '', requiredDocumentTypes: ['x'] });
  expect(response.status).toBe(400);
  expect(prisma.permitDocumentRequirement.upsert).not.toHaveBeenCalled();
});
