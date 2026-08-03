const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  user: {
    findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve({
      id: where.id,
      role: where.id === '22222222-2222-4222-8222-222222222222' ? 'MANAGER' : 'VIEWER',
      municipalityId: 7,
      isActive: true
    }))
  }
}));
jest.mock('../../src/services/permitDocuments', () => ({
  listPermitDocuments: jest.fn(),
  addPermitDocument: jest.fn(),
  reviewPermitDocument: jest.fn()
}));

const {
  listPermitDocuments,
  addPermitDocument,
  reviewPermitDocument
} = require('../../src/services/permitDocuments');
const app = require('../../src/app');
const config = require('../../src/config');

const permitId = '33333333-3333-4333-8333-333333333333';
const documentId = '44444444-4444-4444-8444-444444444444';
const managerToken = jwt.sign({
  sub: '22222222-2222-4222-8222-222222222222',
  municipalityId: 7,
  role: 'MANAGER'
}, config.jwtSecret);
const viewerToken = jwt.sign({
  sub: '55555555-5555-4555-8555-555555555555',
  municipalityId: 7,
  role: 'VIEWER'
}, config.jwtSecret);

const validDocument = {
  documentType: 'PLAN',
  fileName: 'plan.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 1024,
  storageKey: 'permits/7/plan.pdf',
  sha256: 'a'.repeat(64),
  description: 'Plan du chantier'
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('liste les pièces d’un permis municipal', async () => {
  listPermitDocuments.mockResolvedValue([{ id: documentId, status: 'PENDING' }]);

  const response = await request(app)
    .get(`/api/v1/permits/${permitId}/documents`)
    .set('Authorization', `Bearer ${viewerToken}`);

  expect(response.status).toBe(200);
  expect(response.body).toHaveLength(1);
  expect(listPermitDocuments).toHaveBeenCalledWith(expect.anything(), {
    permitId,
    municipalityId: 7
  });
});

test('ajoute une pièce valide', async () => {
  addPermitDocument.mockResolvedValue({ id: documentId, ...validDocument, status: 'PENDING' });

  const response = await request(app)
    .post(`/api/v1/permits/${permitId}/documents`)
    .set('Authorization', `Bearer ${managerToken}`)
    .send(validDocument);

  expect(response.status).toBe(201);
  expect(response.body.document).toMatchObject({ id: documentId, status: 'PENDING' });
  expect(addPermitDocument).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
    permitId,
    municipalityId: 7,
    actorRole: 'MANAGER',
    document: validDocument
  }));
});

test('refuse des métadonnées de pièce invalides', async () => {
  const response = await request(app)
    .post(`/api/v1/permits/${permitId}/documents`)
    .set('Authorization', `Bearer ${managerToken}`)
    .send({ fileName: '' });

  expect(response.status).toBe(400);
  expect(addPermitDocument).not.toHaveBeenCalled();
});

test('accepte une pièce avec une décision valide', async () => {
  reviewPermitDocument.mockResolvedValue({ id: documentId, status: 'ACCEPTED' });

  const response = await request(app)
    .post(`/api/v1/permits/${permitId}/documents/${documentId}/review`)
    .set('Authorization', `Bearer ${managerToken}`)
    .send({ status: 'ACCEPTED' });

  expect(response.status).toBe(200);
  expect(response.body.document.status).toBe('ACCEPTED');
  expect(reviewPermitDocument).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
    permitId,
    documentId,
    municipalityId: 7,
    status: 'ACCEPTED'
  }));
});

test('refuse un identifiant de pièce invalide', async () => {
  const response = await request(app)
    .post(`/api/v1/permits/${permitId}/documents/invalide/review`)
    .set('Authorization', `Bearer ${managerToken}`)
    .send({ status: 'ACCEPTED' });

  expect(response.status).toBe(400);
  expect(reviewPermitDocument).not.toHaveBeenCalled();
});

test('refuse une décision de pièce invalide', async () => {
  const response = await request(app)
    .post(`/api/v1/permits/${permitId}/documents/${documentId}/review`)
    .set('Authorization', `Bearer ${managerToken}`)
    .send({ status: 'PENDING' });

  expect(response.status).toBe(400);
  expect(reviewPermitDocument).not.toHaveBeenCalled();
});

test('mappe une pièce dupliquée en conflit', async () => {
  addPermitDocument.mockRejectedValue(Object.assign(new Error('Déjà présente'), {
    code: 'PERMIT_DOCUMENT_DUPLICATE'
  }));

  const response = await request(app)
    .post(`/api/v1/permits/${permitId}/documents`)
    .set('Authorization', `Bearer ${managerToken}`)
    .send(validDocument);

  expect(response.status).toBe(409);
  expect(response.body.code).toBe('PERMIT_DOCUMENT_DUPLICATE');
});
