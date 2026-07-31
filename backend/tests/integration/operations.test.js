const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/services/outbox', () => ({
  getOutboxSummary: jest.fn(),
  listDeadOutboxEvents: jest.fn(),
  retryDeadOutboxEvent: jest.fn()
}));

jest.mock('../../src/services/operationalAlerts', () => ({
  getAlertSummary: jest.fn(),
  listOperationalAlerts: jest.fn(),
  acknowledgeOperationalAlert: jest.fn()
}));

jest.mock('../../src/services/deliveryServiceLevels', () => ({
  getDeliveryServiceLevels: jest.fn(),
  createDeliverySlaAlerts: jest.fn()
}));

const app = require('../../src/app');
const {
  getOutboxSummary,
  listDeadOutboxEvents,
  retryDeadOutboxEvent
} = require('../../src/services/outbox');
const {
  getAlertSummary,
  listOperationalAlerts,
  acknowledgeOperationalAlert
} = require('../../src/services/operationalAlerts');
const {
  getDeliveryServiceLevels,
  createDeliverySlaAlerts
} = require('../../src/services/deliveryServiceLevels');

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

  it('réserve les opérations aux administrateurs', async () => {
    const res = await request(app)
      .get('/api/v1/operations/alerts')
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

  it('calcule les niveaux de service et crée les alertes pour la municipalité du jeton', async () => {
    createDeliverySlaAlerts.mockResolvedValue(2);
    getDeliveryServiceLevels.mockResolvedValue({
      health: 'WARNING',
      metrics: { warningCount: 2 }
    });

    const res = await request(app)
      .get('/api/v1/operations/diffusion/service-levels')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.health).toBe('WARNING');
    expect(createDeliverySlaAlerts).toHaveBeenCalledWith({ municipalityId: 1 });
    expect(getDeliveryServiceLevels).toHaveBeenCalledWith({ municipalityId: 1 });
  });

  it('interdit les niveaux de service aux agents non administrateurs', async () => {
    const res = await request(app)
      .get('/api/v1/operations/diffusion/service-levels')
      .set('Authorization', `Bearer ${agentToken}`);

    expect(res.status).toBe(403);
    expect(createDeliverySlaAlerts).not.toHaveBeenCalled();
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

  it('retourne uniquement les alertes de la municipalité du jeton', async () => {
    getAlertSummary.mockResolvedValue([{ status: 'OPEN', severity: 'CRITICAL', count: 1 }]);
    listOperationalAlerts.mockResolvedValue([{ id: 'alert-1', status: 'OPEN' }]);

    const res = await request(app)
      .get('/api/v1/operations/alerts?status=OPEN')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(getAlertSummary).toHaveBeenCalledWith({ municipalityId: 1 });
    expect(listOperationalAlerts).toHaveBeenCalledWith({ municipalityId: 1, status: 'OPEN' });
  });

  it('acquitte une alerte avec la municipalité et l’acteur du jeton', async () => {
    const id = '44444444-4444-4444-8444-444444444444';
    acknowledgeOperationalAlert.mockResolvedValue({ id, status: 'ACKNOWLEDGED' });

    const res = await request(app)
      .post(`/api/v1/operations/alerts/${id}/acknowledge`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(acknowledgeOperationalAlert).toHaveBeenCalledWith({
      id,
      municipalityId: 1,
      actorId: '11111111-1111-4111-8111-111111111111'
    });
  });

  it('refuse un statut d’alerte non autorisé', async () => {
    const res = await request(app)
      .get('/api/v1/operations/alerts?status=DELETED')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });
});
