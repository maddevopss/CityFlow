const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jsonwebtoken');

jest.mock('../../src/services/outbox', () => ({
  appendOutboxEvent: jest.fn().mockResolvedValue('outbox-1')
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
const { appendOutboxEvent } = require('../../src/services/outbox');

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
    prisma.user.findUnique.mockResolvedValue({ isActive: true });
    prisma.$transaction.mockImplementation(async (callback) => callback(prisma));
    appendOutboxEvent.mockResolvedValue('outbox-1');
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
      expect(appendOutboxEvent).not.toHaveBeenCalled();
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
      expect(appendOutboxEvent).not.toHaveBeenCalled();
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
      expect(appendOutboxEvent).not.toHaveBeenCalled();
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
      expect(appendOutboxEvent).not.toHaveBeenCalled();
    });

    it('écrit la demande de diffusion dans la même transaction que la publication', async () => {
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
      expect(appendOutboxEvent).toHaveBeenCalledWith(expect.objectContaining({
        aggregateId: 'event-1',
        municipalityId: 1,
        eventType: 'ROAD_EVENT_DIFFUSION_REQUESTED',
        payload: { eventId: 'event-1' },
        dedupeKey: 'road-event:event-1:PLANNED',
        db: prisma
      }));
    });

    it('annule la publication lorsque l’écriture de sortie échoue', async () => {
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
      appendOutboxEvent.mockRejectedValueOnce(new Error('outbox unavailable'));

      const res = await request(app)
        .post('/api/v1/events/event-1/publish')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(res.status).toBeGreaterThanOrEqual(500);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
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
