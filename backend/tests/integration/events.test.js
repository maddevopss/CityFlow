const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jsonwebtoken');

jest.mock('../../src/workers/queue', () => ({
  queue: { add: jest.fn().mockResolvedValue({ id: 'job-1' }) }
}));

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
    it('crée un événement dans la municipalité du jeton', async () => {
      prisma.roadEvent.create.mockResolvedValue({
        id: '123',
        eventType: 'CONSTRUCTION',
        municipalityId: 1,
        status: 'PLANNED'
      });

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
      expect(prisma.roadEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ municipalityId: 1 })
        })
      );
    });

    it('retourne 401 sans token', async () => {
      const res = await request(app).post('/api/v1/events').send({});
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/events', () => {
    it('refuse la lecture sans authentification', async () => {
      const res = await request(app).get('/api/v1/events');
      expect(res.status).toBe(401);
    });

    it('force la municipalité du jeton et ignore tout municipalityId fourni', async () => {
      prisma.roadEvent.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/events')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ municipalityId: 999, status: 'ACTIVE' });

      expect(res.status).toBe(200);
      expect(prisma.roadEvent.findMany).toHaveBeenCalledWith({
        where: { municipalityId: 1, status: 'ACTIVE' },
        orderBy: { startTime: 'asc' }
      });
    });
  });
});
