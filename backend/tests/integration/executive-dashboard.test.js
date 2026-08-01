const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({ $queryRawUnsafe: jest.fn() }));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');
const secret = process.env.JWT_SECRET || 'test-secret';
const token = jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', role: 'EXECUTIVE_VIEWER', municipalityId: 7 }, secret);
const managerToken = jwt.sign({ sub: '22222222-2222-4222-8222-222222222222', role: 'MUNICIPAL_MANAGER', municipalityId: 8 }, secret);
const viewerToken = jwt.sign({ sub: '33333333-3333-4333-8333-333333333333', role: 'VIEWER', municipalityId: 7 }, secret);

function mockRows(rows = {}) {
  prisma.$queryRawUnsafe
    .mockResolvedValueOnce(rows.inspections ?? [{ count: 10n, completed: 8n, non_compliant: 2n }])
    .mockResolvedValueOnce(rows.permits ?? [{ count: 6n, issued: 3n, pending: 2n }])
    .mockResolvedValueOnce(rows.assets ?? [{ count: 100n, out_of_service: 5n, critical: 7n }])
    .mockResolvedValueOnce(rows.workOrders ?? [{ count: 20n, backlog: 9n, actual_cost: '12500.50' }])
    .mockResolvedValueOnce(rows.reports ?? [{ count: 30n, open: 12n, resolved: 18n }]);
}

describe('Executive dashboard API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('refuse une requête non authentifiée', async () => {
    expect((await request(app).get('/api/v1/executive-dashboard')).status).toBe(401);
  });

  it('refuse un rôle sans accès exécutif', async () => {
    expect((await request(app).get('/api/v1/executive-dashboard').set('Authorization', `Bearer ${viewerToken}`)).status).toBe(403);
  });

  it('agrège les cinq modules pour la municipalité du jeton', async () => {
    mockRows();
    const response = await request(app).get('/api/v1/executive-dashboard').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.municipalityId).toBe(7);
    expect(response.body.modules).toEqual({
      inspections: { total: 10, completed: 8, nonCompliant: 2 },
      permits: { total: 6, issued: 3, pending: 2 },
      assets: { total: 100, outOfService: 5, critical: 7 },
      publicWorks: { total: 20, backlog: 9, actualCost: 12500.5 },
      citizenReports: { total: 30, open: 12, resolved: 18 }
    });
    expect(prisma.$queryRawUnsafe).toHaveBeenCalledTimes(5);
    expect(prisma.$queryRawUnsafe.mock.calls[0][1]).toBe(7);
  });

  it('utilise la période explicite et le rôle de gestionnaire', async () => {
    mockRows();
    const from = '2026-07-01T00:00:00.000Z';
    const to = '2026-07-31T23:59:59.000Z';
    const response = await request(app)
      .get(`/api/v1/executive-dashboard?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      .set('Authorization', `Bearer ${managerToken}`);
    expect(response.status).toBe(200);
    expect(response.body.municipalityId).toBe(8);
    expect(response.body.period).toEqual({ from, to });
    expect(prisma.$queryRawUnsafe.mock.calls[0][1]).toBe(8);
    expect(prisma.$queryRawUnsafe.mock.calls[0][4]).toEqual(new Date(from));
    expect(prisma.$queryRawUnsafe.mock.calls[0][5]).toEqual(new Date(to));
  });

  it('normalise les lignes absentes et les valeurs nulles à zéro', async () => {
    mockRows({
      inspections: [],
      permits: [{}],
      assets: [{ count: null, out_of_service: null, critical: null }],
      workOrders: [{ count: 4, backlog: null, actual_cost: null }],
      reports: [{ count: 0n, open: 0n, resolved: 0n }]
    });
    const response = await request(app).get('/api/v1/executive-dashboard').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.modules).toEqual({
      inspections: { total: 0, completed: 0, nonCompliant: 0 },
      permits: { total: 0, issued: 0, pending: 0 },
      assets: { total: 0, outOfService: 0, critical: 0 },
      publicWorks: { total: 4, backlog: 0, actualCost: 0 },
      citizenReports: { total: 0, open: 0, resolved: 0 }
    });
  });

  it('accepte une période ne contenant que la date de début', async () => {
    mockRows();
    const response = await request(app)
      .get('/api/v1/executive-dashboard?from=2026-07-01T00:00:00.000Z')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.period.from).toBe('2026-07-01T00:00:00.000Z');
    expect(new Date(response.body.period.to).getTime()).toBeGreaterThan(new Date(response.body.period.from).getTime());
  });

  it('accepte une période ne contenant que la date de fin', async () => {
    mockRows();
    const response = await request(app)
      .get('/api/v1/executive-dashboard?to=2026-08-01T00:00:00.000Z')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.period.to).toBe('2026-08-01T00:00:00.000Z');
  });

  it('refuse une période inversée', async () => {
    const response = await request(app).get('/api/v1/executive-dashboard?from=2026-08-10T00:00:00.000Z&to=2026-08-01T00:00:00.000Z').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(400);
    expect(prisma.$queryRawUnsafe).not.toHaveBeenCalled();
  });

  it('refuse une date invalide', async () => {
    const response = await request(app).get('/api/v1/executive-dashboard?from=pas-une-date').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(400);
  });
});
