const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  user: { findUnique: jest.fn() },
  inspection: { findMany: jest.fn() },
  inspectionReminder: {
    findMany: jest.fn(),
    upsert: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn()
  }
}));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');

describe('Inspection reminders API', () => {
  const secret = process.env.JWT_SECRET || 'test-secret';
  const inspectorId = '44444444-4444-4444-8444-444444444444';
  const reminderId = '55555555-5555-4555-8555-555555555555';
  const agentToken = jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', role: 'MUNICIPAL_AGENT', municipalityId: 7 }, secret);
  const inspectorToken = jwt.sign({ sub: inspectorId, role: 'INSPECTOR', municipalityId: 7 }, secret);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue({ isActive: true });
  });

  it('limite un inspecteur à ses propres rappels', async () => {
    prisma.inspectionReminder.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/v1/inspection-reminders').set('Authorization', `Bearer ${inspectorToken}`);
    expect(res.status).toBe(200);
    expect(prisma.inspectionReminder.findMany).toHaveBeenCalledWith({
      where: { municipalityId: 7, recipientId: inspectorId },
      orderBy: { scheduledFor: 'asc' }
    });
  });

  it('génère les rappels des inspections assignées à venir', async () => {
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000);
    prisma.inspection.findMany.mockResolvedValue([{ id: reminderId, assignedTo: inspectorId, scheduledAt }]);
    prisma.inspectionReminder.upsert.mockResolvedValue({ id: reminderId });
    const res = await request(app).post('/api/v1/inspection-reminders/generate').set('Authorization', `Bearer ${agentToken}`);
    expect(res.status).toBe(201);
    expect(res.body.generated).toBe(1);
  });

  it('interdit la génération à un inspecteur', async () => {
    const res = await request(app).post('/api/v1/inspection-reminders/generate').set('Authorization', `Bearer ${inspectorToken}`);
    expect(res.status).toBe(403);
  });

  it('acquitte un rappel visible par son destinataire', async () => {
    prisma.inspectionReminder.findFirst.mockResolvedValue({ id: reminderId });
    prisma.inspectionReminder.update.mockResolvedValue({ id: reminderId, status: 'ACKNOWLEDGED' });
    const res = await request(app).post(`/api/v1/inspection-reminders/${reminderId}/acknowledge`).set('Authorization', `Bearer ${inspectorToken}`);
    expect(res.status).toBe(200);
    expect(prisma.inspectionReminder.update).toHaveBeenCalledWith({
      where: { id: reminderId },
      data: { status: 'ACKNOWLEDGED', acknowledgedAt: expect.any(Date) }
    });
  });

  it('retourne 404 pour un rappel hors municipalité ou hors destinataire', async () => {
    prisma.inspectionReminder.findFirst.mockResolvedValue(null);
    const res = await request(app).post(`/api/v1/inspection-reminders/${reminderId}/acknowledge`).set('Authorization', `Bearer ${inspectorToken}`);
    expect(res.status).toBe(404);
    expect(prisma.inspectionReminder.update).not.toHaveBeenCalled();
  });
});
