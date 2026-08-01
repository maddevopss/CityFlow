const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  workOrder: { count: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  workLog: { create: jest.fn() },
  $transaction: jest.fn(values => Promise.all(values))
}));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');
const secret = process.env.JWT_SECRET || 'test-secret';
const token = jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', role: 'PUBLIC_WORKS_MANAGER', municipalityId: 7 }, secret);
const workerToken = jwt.sign({ sub: '22222222-2222-4222-8222-222222222222', role: 'FIELD_WORKER', municipalityId: 7 }, secret);
const viewerToken = jwt.sign({ sub: '44444444-4444-4444-8444-444444444444', role: 'VIEWER', municipalityId: 7 }, secret);
const id = '33333333-3333-4333-8333-333333333333';
const teamId = '55555555-5555-4555-8555-555555555555';

describe('Work orders API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(values => Promise.all(values));
  });

  it('refuse les requêtes non authentifiées et les rôles non autorisés', async () => {
    expect((await request(app).get('/api/v1/work-orders')).status).toBe(401);
    expect((await request(app).get('/api/v1/work-orders').set('Authorization', `Bearer ${viewerToken}`)).status).toBe(403);
  });

  it('liste avec pagination et filtres', async () => {
    prisma.workOrder.count.mockResolvedValue(21);
    prisma.workOrder.findMany.mockResolvedValue([{ id }]);
    const response = await request(app).get(`/api/v1/work-orders?page=2&pageSize=10&status=ASSIGNED&priority=URGENT&assignedTeamId=${teamId}&q=conduite`).set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({ page: 2, pageSize: 10, total: 21, totalPages: 3 });
    expect(prisma.workOrder.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 10, take: 10 }));
  });

  it('liste avec les valeurs par défaut', async () => {
    prisma.workOrder.count.mockResolvedValue(0);
    prisma.workOrder.findMany.mockResolvedValue([]);
    const response = await request(app).get('/api/v1/work-orders').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.pagination.pageSize).toBe(25);
  });

  it('refuse des filtres invalides', async () => {
    expect((await request(app).get('/api/v1/work-orders?page=0&priority=UNKNOWN').set('Authorization', `Bearer ${token}`)).status).toBe(400);
  });

  it('crée un ordre numéroté et isolé', async () => {
    prisma.workOrder.count.mockResolvedValue(0);
    prisma.workOrder.create.mockResolvedValue({ id, publicNumber: 'WO-7-000001', status: 'DRAFT' });
    const response = await request(app).post('/api/v1/work-orders').set('Authorization', `Bearer ${token}`).send({ title: 'Réparer une conduite', description: 'Fuite sur conduite principale', workType: 'CORRECTIVE', priority: 'HIGH' });
    expect(response.status).toBe(201);
    expect(prisma.workOrder.create).toHaveBeenCalledWith({ data: expect.objectContaining({ municipalityId: 7, publicNumber: 'WO-7-000001', scheduledStart: null, scheduledEnd: null }) });
  });

  it('crée un ordre planifié avec dates', async () => {
    prisma.workOrder.count.mockResolvedValue(4);
    prisma.workOrder.create.mockResolvedValue({ id });
    const response = await request(app).post('/api/v1/work-orders').set('Authorization', `Bearer ${token}`).send({ title: 'Entretien préventif', description: 'Inspection annuelle', workType: 'PREVENTIVE', scheduledStart: '2026-08-10T12:00:00.000Z', scheduledEnd: '2026-08-10T16:00:00.000Z' });
    expect(response.status).toBe(201);
    expect(prisma.workOrder.create).toHaveBeenCalledWith({ data: expect.objectContaining({ scheduledStart: expect.any(Date), scheduledEnd: expect.any(Date) }) });
  });

  it('refuse une création invalide ou par un travailleur terrain', async () => {
    expect((await request(app).post('/api/v1/work-orders').set('Authorization', `Bearer ${token}`).send({ title: 'x' })).status).toBe(400);
    expect((await request(app).post('/api/v1/work-orders').set('Authorization', `Bearer ${workerToken}`).send({ title: 'Ordre valide', description: 'Description valide', workType: 'CORRECTIVE' })).status).toBe(403);
  });

  it('retourne le détail ou 404', async () => {
    prisma.workOrder.findFirst.mockResolvedValueOnce({ id }).mockResolvedValueOnce(null);
    expect((await request(app).get(`/api/v1/work-orders/${id}`).set('Authorization', `Bearer ${token}`)).status).toBe(200);
    expect((await request(app).get(`/api/v1/work-orders/${id}`).set('Authorization', `Bearer ${token}`)).status).toBe(404);
  });

  it.each(['DRAFT', 'PLANNED', 'ASSIGNED'])('affecte un ordre depuis %s', async status => {
    prisma.workOrder.findFirst.mockResolvedValue({ id, status });
    prisma.workOrder.update.mockResolvedValue({ id, status: 'ASSIGNED' });
    const response = await request(app).post(`/api/v1/work-orders/${id}/assign`).set('Authorization', `Bearer ${token}`).send({ assignedTeamId: teamId, scheduledStart: '2026-08-10T12:00:00.000Z', scheduledEnd: '2026-08-10T16:00:00.000Z' });
    expect(response.status).toBe(200);
  });

  it('refuse une affectation invalide, absente ou hors état', async () => {
    expect((await request(app).post(`/api/v1/work-orders/${id}/assign`).set('Authorization', `Bearer ${token}`).send({ assignedTeamId: 'bad' })).status).toBe(400);
    prisma.workOrder.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ id, status: 'COMPLETED' });
    const payload = { assignedTeamId: teamId, scheduledStart: '2026-08-10T12:00:00.000Z', scheduledEnd: '2026-08-10T16:00:00.000Z' };
    expect((await request(app).post(`/api/v1/work-orders/${id}/assign`).set('Authorization', `Bearer ${token}`).send(payload)).status).toBe(404);
    expect((await request(app).post(`/api/v1/work-orders/${id}/assign`).set('Authorization', `Bearer ${token}`).send(payload)).status).toBe(409);
  });

  it('démarre un ordre affecté et refuse les autres cas', async () => {
    prisma.workOrder.findFirst.mockResolvedValueOnce({ id, status: 'ASSIGNED' }).mockResolvedValueOnce({ id, status: 'DRAFT' }).mockResolvedValueOnce(null);
    prisma.workOrder.update.mockResolvedValue({ id, status: 'IN_PROGRESS' });
    expect((await request(app).post(`/api/v1/work-orders/${id}/start`).set('Authorization', `Bearer ${workerToken}`)).status).toBe(200);
    expect((await request(app).post(`/api/v1/work-orders/${id}/start`).set('Authorization', `Bearer ${workerToken}`)).status).toBe(409);
    expect((await request(app).post(`/api/v1/work-orders/${id}/start`).set('Authorization', `Bearer ${workerToken}`)).status).toBe(404);
  });

  it.each(['IN_PROGRESS', 'BLOCKED', 'COMPLETED'])('ajoute un journal en état %s', async status => {
    prisma.workOrder.findFirst.mockResolvedValue({ id, status });
    prisma.workLog.create.mockResolvedValue({ id: '44444444-4444-4444-8444-444444444444' });
    const response = await request(app).post(`/api/v1/work-orders/${id}/logs`).set('Authorization', `Bearer ${workerToken}`).send({ logType: 'TIME', description: 'Intervention terrain', hours: 2 });
    expect(response.status).toBe(201);
  });

  it('refuse un journal invalide, absent ou hors état', async () => {
    expect((await request(app).post(`/api/v1/work-orders/${id}/logs`).set('Authorization', `Bearer ${workerToken}`).send({ logType: 'UNKNOWN', description: 'x' })).status).toBe(400);
    prisma.workOrder.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ id, status: 'DRAFT' });
    const payload = { logType: 'NOTE', description: 'Journal valide' };
    expect((await request(app).post(`/api/v1/work-orders/${id}/logs`).set('Authorization', `Bearer ${workerToken}`).send(payload)).status).toBe(404);
    expect((await request(app).post(`/api/v1/work-orders/${id}/logs`).set('Authorization', `Bearer ${workerToken}`).send(payload)).status).toBe(409);
  });

  it.each(['IN_PROGRESS', 'BLOCKED'])('termine un ordre depuis %s', async status => {
    prisma.workOrder.findFirst.mockResolvedValue({ id, status });
    prisma.workOrder.update.mockResolvedValue({ id, status: 'COMPLETED' });
    const response = await request(app).post(`/api/v1/work-orders/${id}/complete`).set('Authorization', `Bearer ${workerToken}`).send({ actualCost: 1250, summary: 'Travaux terminés' });
    expect(response.status).toBe(200);
  });

  it('refuse une clôture invalide, absente ou hors état', async () => {
    expect((await request(app).post(`/api/v1/work-orders/${id}/complete`).set('Authorization', `Bearer ${workerToken}`).send({ actualCost: -1, summary: 'x' })).status).toBe(400);
    prisma.workOrder.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ id, status: 'ASSIGNED' });
    const payload = { actualCost: 100, summary: 'Travaux terminés' };
    expect((await request(app).post(`/api/v1/work-orders/${id}/complete`).set('Authorization', `Bearer ${workerToken}`).send(payload)).status).toBe(404);
    expect((await request(app).post(`/api/v1/work-orders/${id}/complete`).set('Authorization', `Bearer ${workerToken}`).send(payload)).status).toBe(409);
  });
});
