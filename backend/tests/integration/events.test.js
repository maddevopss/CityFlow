const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jsonwebtoken');

// Mock du worker queue
jest.mock('../../src/workers/queue', () => ({
  queue: { add: jest.fn().mockResolvedValue({ id: 'job-1' }) }
}));

// Mock Prisma pour les tests d'intégration
jest.mock('../../src/db/prisma', () => ({
  roadEvent: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn()
  },
  user: {
    findUnique: jest.fn()
  },
  $disconnect: jest.fn()
}));

const prisma = require('../../src/db/prisma');

describe('Events API', () => {
  let authToken;

  beforeAll(() => {
    authToken = jwt.sign(
      { sub: 'user-1', role: 'MUNICIPAL_AGENT', municipalityId: 1 },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/events', () => {
    it('devrait créer un événement et retourner 201', async () => {
      const mockEvent = {
        id: '123',
        eventType: 'CONSTRUCTION',
        subtype: 'road_work',
        municipalityId: 1,
        status: 'PLANNED',
        geometry: { type: 'Point', coordinates: [-71.2, 46.8] },
        startTime: new Date().toISOString(),
        impacts: ['lane_closure'],
        details: {}
      };

      prisma.roadEvent.create.mockResolvedValue(mockEvent);

      const res = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventType: 'CONSTRUCTION',
          subtype: 'road_work',
          geometry: { type: 'Point', coordinates: [-71.2, 46.8] },
          startTime: new Date().toISOString(),
          impacts: ['lane_closure']
        });

      expect(res.status).toBe(201);
      expect(res.body.eventType).toBe('CONSTRUCTION');
    });

    it('devrait retourner 401 sans token', async () => {
      const res = await request(app)
        .post('/api/v1/events')
        .send({
          eventType: 'CONSTRUCTION',
          subtype: 'road_work'
        });

      expect(res.status).toBe(401);
    });

    it('devrait retourner 400 avec des données invalides', async () => {
      const res = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventType: 'INVALID_TYPE'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/events', () => {
    it('devrait retourner la liste des événements', async () => {
      const mockEvents = [
        { id: '1', eventType: 'CONSTRUCTION', status: 'ACTIVE' },
        { id: '2', eventType: 'REGULATION', status: 'PLANNED' }
      ];

      prisma.roadEvent.findMany.mockResolvedValue(mockEvents);

      const res = await request(app)
        .get('/api/v1/events')
        .query({ status: 'ACTIVE' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
