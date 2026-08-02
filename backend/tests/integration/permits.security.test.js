const crypto = require('crypto');
const request = require('supertest');

jest.mock('../../src/db/prisma', () => ({
  municipality: {
    findUnique: jest.fn()
  },
  roadEvent: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
}));

const app = require('../../src/app');
const config = require('../../src/config');
const prisma = require('../../src/db/prisma');

function signRaw(rawBody, timestamp) {
  return crypto
    .createHmac('sha256', config.permitWebhookSecret)
    .update(`${timestamp}.`)
    .update(rawBody)
    .digest('hex');
}

function sign(body, timestamp) {
  return signRaw(JSON.stringify(body), timestamp);
}

describe('Permit webhook security', () => {
  const validBody = {
    permit_id: 'PERMIT-001',
    contractor: 'Entrepreneur exemple',
    start_date: '2026-08-01T12:00:00.000Z',
    end_date: '2026-08-02T12:00:00.000Z',
    municipalityId: 1,
    geometry: {
      type: 'Point',
      coordinates: [-71.2, 46.8]
    },
    impacts: ['lane_closure']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.roadEvent.findFirst.mockResolvedValue(null);
  });

  it('refuse un webhook sans signature', async () => {
    const response = await request(app)
      .post('/api/v1/permits/hook')
      .send(validBody);

    expect(response.status).toBe(401);
    expect(prisma.roadEvent.create).not.toHaveBeenCalled();
  });

  it('refuse une signature expirée', async () => {
    const timestamp = Math.floor(Date.now() / 1000) - 3600;

    const response = await request(app)
      .post('/api/v1/permits/hook')
      .set('x-cityflow-timestamp', String(timestamp))
      .set('x-cityflow-signature', sign(validBody, timestamp))
      .send(validBody);

    expect(response.status).toBe(401);
    expect(prisma.roadEvent.create).not.toHaveBeenCalled();
  });

  it('refuse un timestamp ou une signature mal formés', async () => {
    const response = await request(app)
      .post('/api/v1/permits/hook')
      .set('x-cityflow-timestamp', '1e3')
      .set('x-cityflow-signature', 'signature-invalide')
      .send(validBody);

    expect(response.status).toBe(401);
    expect(prisma.municipality.findUnique).not.toHaveBeenCalled();
    expect(prisma.roadEvent.create).not.toHaveBeenCalled();
  });

  it('refuse un type de contenu autre que JSON', async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const rawBody = 'permit_id=PERMIT-001';

    const response = await request(app)
      .post('/api/v1/permits/hook')
      .set('Content-Type', 'text/plain')
      .set('x-cityflow-timestamp', String(timestamp))
      .set('x-cityflow-signature', signRaw(rawBody, timestamp))
      .send(rawBody);

    expect(response.status).toBe(415);
    expect(prisma.municipality.findUnique).not.toHaveBeenCalled();
  });

  it('vérifie la signature sur les octets JSON exacts reçus', async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const rawBody = JSON.stringify(validBody, null, 2);
    prisma.municipality.findUnique.mockResolvedValue({ id: 1 });
    prisma.roadEvent.create.mockResolvedValue({ id: 'event-1' });

    const response = await request(app)
      .post('/api/v1/permits/hook')
      .set('Content-Type', 'application/json')
      .set('x-cityflow-timestamp', String(timestamp))
      .set('x-cityflow-signature', signRaw(rawBody, timestamp))
      .send(rawBody);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ eventId: 'event-1', status: 'draft', operation: 'created' });
  });

  it('refuse une signature calculée sur un JSON différent', async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const rawBody = JSON.stringify(validBody, null, 2);

    const response = await request(app)
      .post('/api/v1/permits/hook')
      .set('Content-Type', 'application/json')
      .set('x-cityflow-timestamp', String(timestamp))
      .set('x-cityflow-signature', sign(validBody, timestamp))
      .send(rawBody);

    expect(response.status).toBe(401);
    expect(prisma.municipality.findUnique).not.toHaveBeenCalled();
    expect(prisma.roadEvent.create).not.toHaveBeenCalled();
  });

  it('crée un brouillon pour un nouveau permis signé', async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    prisma.municipality.findUnique.mockResolvedValue({ id: 1 });
    prisma.roadEvent.create.mockResolvedValue({ id: 'event-1' });

    const response = await request(app)
      .post('/api/v1/permits/hook')
      .set('x-cityflow-timestamp', String(timestamp))
      .set('x-cityflow-signature', sign(validBody, timestamp))
      .send(validBody);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ eventId: 'event-1', status: 'draft', operation: 'created' });
  });

  it('met à jour le brouillon existant pour le même permis', async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    prisma.municipality.findUnique.mockResolvedValue({ id: 1 });
    prisma.roadEvent.findFirst.mockResolvedValue({ id: 'event-1', status: 'DRAFT' });
    prisma.roadEvent.update.mockResolvedValue({ id: 'event-1' });

    const response = await request(app)
      .post('/api/v1/permits/hook')
      .set('x-cityflow-timestamp', String(timestamp))
      .set('x-cityflow-signature', sign(validBody, timestamp))
      .send(validBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ eventId: 'event-1', status: 'draft', operation: 'updated' });
    expect(prisma.roadEvent.create).not.toHaveBeenCalled();
  });

  it('refuse de réécrire un permis déjà soumis ou publié', async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    prisma.municipality.findUnique.mockResolvedValue({ id: 1 });
    prisma.roadEvent.findFirst.mockResolvedValue({ id: 'event-1', status: 'ACTIVE' });

    const response = await request(app)
      .post('/api/v1/permits/hook')
      .set('x-cityflow-timestamp', String(timestamp))
      .set('x-cityflow-signature', sign(validBody, timestamp))
      .send(validBody);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      message: 'Ce permis a déjà quitté l’état brouillon',
      code: 'PERMIT_ALREADY_PROCESSED',
      eventId: 'event-1'
    });
  });
});
