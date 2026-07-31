const request = require('supertest');

jest.mock('../../src/db/prisma', () => ({
  roadEvent: {
    findMany: jest.fn()
  },
  municipality: {
    findUnique: jest.fn()
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn()
  },
  $disconnect: jest.fn()
}));

jest.mock('../../src/workers/queue', () => ({
  queue: { add: jest.fn() }
}));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');

describe('GET /api/v1/exports/geojson', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('refuse un export sans municipalité explicite', async () => {
    const response = await request(app).get('/api/v1/exports/geojson');

    expect(response.status).toBe(400);
    expect(prisma.roadEvent.findMany).not.toHaveBeenCalled();
  });

  it('force les statuts publics et sélectionne uniquement les champs publiables', async () => {
    prisma.roadEvent.findMany.mockResolvedValue([
      {
        id: 'event-1',
        eventType: 'CONSTRUCTION',
        subtype: 'travaux',
        geometry: { type: 'Point', coordinates: [-71.2, 46.8] },
        startTime: new Date('2026-08-01T12:00:00.000Z'),
        endTime: null,
        impacts: ['lane_closure'],
        status: 'ACTIVE',
        updatedAt: new Date('2026-07-30T20:00:00.000Z')
      }
    ]);

    const response = await request(app)
      .get('/api/v1/exports/geojson')
      .query({ municipalityId: 7, status: 'DRAFT' });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/geo+json');
    expect(prisma.roadEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          municipalityId: 7,
          status: { in: ['PLANNED', 'ACTIVE'] }
        },
        select: expect.not.objectContaining({ details: true })
      })
    );
    expect(response.body.features[0].properties).not.toHaveProperty('details');
    expect(response.body.features[0].properties).not.toHaveProperty('sourceRef');
  });

  it('permet seulement un type d’événement connu', async () => {
    const response = await request(app)
      .get('/api/v1/exports/geojson')
      .query({ municipalityId: 7, eventType: 'SECRET_TYPE' });

    expect(response.status).toBe(400);
    expect(prisma.roadEvent.findMany).not.toHaveBeenCalled();
  });
});
