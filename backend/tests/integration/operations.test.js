const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/services/outbox', () => ({
  getOutboxSummary: jest.fn(),
  listDeadOutboxEvents: jest.fn(),
  retryDeadOutboxEvent: jest.fn()
}));

const app = require('../../src/app');
const {
  getOutboxSummary,
  listDeadOutboxEvents,
  retryDeadOutboxEvent
} = require('../../src/services/outbox');

describe('Operations API', () => {
  let adminToken;
  let agentToken;

  beforeAll(() => {
    const secret = process.env.JWT_SECRET || 'test-secret';
    adminToken = jwt.sign(
      { sub: '11111111-1111-4111-8111-111111111111', role: 'ADMIN', municipalityId: 1 },
      secret,
      { expiresIn: '1h' }
    );
    agentToken = jwt.sign(
      { sub: '22222222-2222-4222-8222-222222222222', role: 'MUNICIPAL_AGENT', municipalityId: 1 },
      secret,
      { expiresIn: '1h' }
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('réserve la santé de diffusion aux administrateurs', async () => {
    const res = await request(app)
      .get('/api/v1/operations/diffusion')
      .set('Authorization', `Bearer ${agentToken}`);

    expect(res.status).toBe(403);
  });

  it('isole le résumé et la file morte par municipalité', async () => {
    getOutboxSummary.mockResolvedValue({ DEAD: { count: 1 } });
    listDeadOutboxEvents.mockResolvedValue([{ id: 'dead-1' }]);

    const res = await request(app)
      .get('/api/v1/operations/diffusion')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(getOutboxSummary).toHaveBeenCalledWith({ municipalityId: 1 });
    expect(listDeadOutboxEvents).toHaveBeenCalledWith({ municipalityId: 1 });
  });

  it('relance uniquement une diffusion morte de la municipalité du jeton', async () => {
    const id = '33333333-3333-4333-8333-333333333333';
    retryDeadOutboxEvent.mockResolvedValue({ id });

    const res = await request(app)
      .post(`/api/v1/operations/diffusion/${id}/retry`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(202);
    expect(retryDeadOutboxEvent).toHaveBeenCalledWith({
      id,
      municipalityId: 1,
      actorId: '11111111-1111-4111-8111-111111111111'
    });
  });
});
