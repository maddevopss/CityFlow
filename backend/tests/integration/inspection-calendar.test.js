const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  user: { findUnique: jest.fn() },
  inspection: { findMany: jest.fn() }
}));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');

const secret = process.env.JWT_SECRET || 'test-secret';
const agentToken = jwt.sign(
  { sub: '11111111-1111-4111-8111-111111111111', role: 'MUNICIPAL_AGENT', municipalityId: 7 },
  secret,
  { expiresIn: '1h' }
);
const inspectorId = '44444444-4444-4444-8444-444444444444';
const inspectorToken = jwt.sign(
  { sub: inspectorId, role: 'INSPECTOR', municipalityId: 7 },
  secret,
  { expiresIn: '1h' }
);

const range = '?from=2026-08-03T00:00:00.000Z&to=2026-08-10T00:00:00.000Z';

describe('Inspection calendar API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockImplementation(({ where }) => Promise.resolve({
      id: where.id,
      role: where.id === inspectorId ? 'INSPECTOR' : 'MUNICIPAL_AGENT',
      municipalityId: 7,
      isActive: true
    }));
  });

  it('refuse une plage invalide', async () => {
    const res = await request(app)
      .get('/api/v1/inspection-calendar?from=invalide&to=invalide')
      .set('Authorization', `Bearer ${agentToken}`);
    expect(res.status).toBe(400);
  });

  it('retourne les inspections et détecte les conflits', async () => {
    prisma.inspection.findMany.mockResolvedValue([
      { id: 'a', assignedTo: inspectorId, scheduledAt: '2026-08-04T13:00:00.000Z' },
      { id: 'b', assignedTo: inspectorId, scheduledAt: '2026-08-04T13:30:00.000Z' }
    ]);

    const res = await request(app)
      .get(`/api/v1/inspection-calendar${range}`)
      .set('Authorization', `Bearer ${agentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.conflicts).toEqual(expect.arrayContaining(['a', 'b']));
    expect(prisma.inspection.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ municipalityId: 7 })
    }));
  });

  it('limite un inspecteur à son propre calendrier', async () => {
    prisma.inspection.findMany.mockResolvedValue([]);
    await request(app)
      .get(`/api/v1/inspection-calendar${range}`)
      .set('Authorization', `Bearer ${inspectorToken}`);

    expect(prisma.inspection.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ assignedTo: inspectorId })
    }));
  });

  it('exporte un calendrier iCalendar', async () => {
    prisma.inspection.findMany.mockResolvedValue([{ id: 'a', scheduledAt: '2026-08-04T13:00:00.000Z', address: '100 rue Principale', inspectionType: 'FINAL' }]);

    const res = await request(app)
      .get(`/api/v1/inspection-calendar/export.ics${range}`)
      .set('Authorization', `Bearer ${agentToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/calendar');
    expect(res.text).toContain('BEGIN:VCALENDAR');
    expect(res.text).toContain('SUMMARY:Inspection FINAL');
  });
});
