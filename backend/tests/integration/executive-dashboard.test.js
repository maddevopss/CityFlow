const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({ $queryRawUnsafe: jest.fn() }));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');
const token = jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', role: 'EXECUTIVE_VIEWER', municipalityId: 7 }, process.env.JWT_SECRET || 'test-secret');

describe('Executive dashboard API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('agrège les cinq modules pour la municipalité du jeton', async () => {
    prisma.$queryRawUnsafe
      .mockResolvedValueOnce([{ count: 10n, completed: 8n, non_compliant: 2n }])
      .mockResolvedValueOnce([{ count: 6n, issued: 3n, pending: 2n }])
      .mockResolvedValueOnce([{ count: 100n, out_of_service: 5n, critical: 7n }])
      .mockResolvedValueOnce([{ count: 20n, backlog: 9n, actual_cost: '12500.50' }])
      .mockResolvedValueOnce([{ count: 30n, open: 12n, resolved: 18n }]);
    const response = await request(app).get('/api/v1/executive-dashboard').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.municipalityId).toBe(7);
    expect(response.body.modules.assets.critical).toBe(7);
    expect(response.body.modules.publicWorks.actualCost).toBe(12500.5);
  });

  it('refuse une période inversée', async () => {
    const response = await request(app).get('/api/v1/executive-dashboard?from=2026-08-10T00:00:00.000Z&to=2026-08-01T00:00:00.000Z').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(400);
  });
});
