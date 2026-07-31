const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jsonwebtoken');

jest.mock('../../src/workers/queue', () => ({
  queue: { add: jest.fn().mockResolvedValue({ id: 'job-1' }) }
}));

jest.mock('../../src/db/prisma', () => {
  const mockPrisma = {
    roadEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn()
    },
    user: {
      findUnique: jest.fn()
    },
    $disconnect: jest.fn()
  };

  mockPrisma.$transaction = jest.fn(async (callback) => callback(mockPrisma));
  return mockPrisma;
});

const prisma = require('../../src/db/prisma');
const { queue } = require('../../src/workers/queue');

describe('Events API', () => {
  let agentToken;
  let adminToken;

  beforeAll(() => {
    const secret = process.env.JWT_SECRET || 'test-secret';
    agentToken = jwt.sign(
      { sub: 'agent-1', role: 'MUNICIPAL_AGENT', municipalityId: 1 },
      secret,
      { expiresIn: '1h' }
    );
    adminToken = jwt.sign(
      { sub: 'admin-1', role: 'ADMIN', municipalityId: 1 },
      secret,
      { expiresIn: '1h' }
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
  });

  describe('POST /api/v1/events', () => {
    it('crée le brouillon et son audit dans la même transaction', async () => {
      prisma.roadEvent.create.mockResolvedValue({
        id: '123',
        eventType: 'CONSTRUCTION',
        municipalityId: 1,
        status: 'DRAFT'
      });

      const res = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          eventType: 'CONSTRUCTION',
          subtype: 'road_work',
          geometry: { type: 'Point', coordinates: [-71.2, 46.8] },
          startTime: new Date().toISOString(),
          impacts: ['lane_closure']
        });

      expect(res.status).toBe(201);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.roadEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            municipalityId: 1,
            createdBy: 'agent-1',
            status: 'DRAFT'
          })
        })
      );
      expect(queue.add).not.toHaveBeenCalled();
    });

    it('annule la création lorsque la transaction échoue', async () => {
      prisma.$transaction.mockRejectedValueOnce(new Error('audit unavailable'));

      const res = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          eventType: 'CONSTRUCTION',
          subtype: 'road_work',
          geometry: { type: 'Point', coordinates: [-71.2, 46.8] },
          startTime: new Date().toISOString()
        });

      expect(res.status).toBeGreaterThanOrEqual(500);
      expect(queue.add).not.toHaveBeenCalled();
    });

    it('retourne 401 sans token', async () => {
      const res = await request(app).post('/api/v1/events').send({});
      expect(res.status).toBe(401);
    });
  });

  describe('cycle de vie', () => {
    it('effectue la transition dans une transaction', async () => {
      prisma.roadEvent.findFirst.mockResolvedValue({
        id: 'event-1',
        municipalityId: 1,
        status: 'DRAFT'
      });
      prisma.roadEvent.update.mockResolvedValue({
        id: 'event-1',
        municipalityId: 1,
        status: 'SUBMITTED'
      });

      const res = await request(app)
        .post('/api/v1/events/event-1/submit')
        .set('Authorization', `Bearer ${agentToken}`)
        .send();

      expect(res.status).toBe(200);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.roadEvent.update).toHaveBeenCalledWith({
        where: { id: 'event-1' },
        data: expect.objectContaining({
          status: 'SUBMITTED',
          submittedBy: 'agent-1',
          submittedAt: expect.any(Date)
        })
      });
    });

    it('réserve l’approbation aux administrateurs', async () => {
      const res = await request(app)
        .post('/api/v1/events/event-1/approve')
        .set('Authorization', `Bearer ${agentToken}`)
        .send();

      expect(res.status).toBe(403);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('refuse une transition depuis un mauvais statut sans écrire', async () => {
      prisma.roadEvent.findFirst.mockResolvedValue({
        id: 'event-1',
        municipalityId: 1,
        status: 'DRAFT'
      });

      const res = await request(app)
        .post('/api/v1/events/event-1/approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(res.status).toBe(409);
      expect(res.body.currentStatus).toBe('DRAFT');
      expect(prisma.roadEvent.update).not.toHaveBeenCalled();
    });

    it('diffuse seulement après la réussite de la transaction de publication', async () => {
      prisma.roadEvent.findFirst.mockResolvedValue({
        id: 'event-1',
        municipalityId: 1,
        status: 'APPROVED'
      });
      prisma.roadEvent.update.mockResolvedValue({
        id: 'event-1',
        municipalityId: 1,
        status: 'PLANNED'
      });

      const res = await request(app)
        .post('/api/v1/events/event-1/publish')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(res.status).toBe(200);
      expect(queue.add).toHaveBeenCalledWith('diffuseEvent', { eventId: 'event-1' });
    });

    it('ne diffuse pas lorsque la transaction de publication échoue', async () => {
      prisma.$transaction.mockRejectedValueOnce(new Error('audit unavailable'));

      const res = await request(app)
        .post('/api/v1/events/event-1/publish')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(res.status).toBeGreaterThanOrEqual(500);
      expect(queue.add).not.toHaveBeenCalled();
    });

    it('exige une raison lors du rejet', async () => {
      const res = await request(app)
        .post('/api/v1/events/event-1/reject')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(prisma.$transaction).not.toHaveBeenCalled();
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
        .set('Authorization', `Bearer ${agentToken}`)
        .query({ municipalityId: 999, status: 'ACTIVE' });

      expect(res.status).toBe(200);
      expect(prisma.roadEvent.findMany).toHaveBeenCalledWith({
        where: { municipalityId: 1, status: 'ACTIVE' },
        orderBy: { startTime: 'asc' }
      });
    });
  });
});
