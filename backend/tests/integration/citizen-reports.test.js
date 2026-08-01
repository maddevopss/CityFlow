const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  municipality: { findUnique: jest.fn() },
  citizenReport: { count: jest.fn(), create: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), update: jest.fn() },
  citizenReportMessage: { create: jest.fn() },
  $transaction: jest.fn()
}));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');
const secret = process.env.JWT_SECRET || 'test-secret';
const token = jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', role: 'CITIZEN_SERVICE_AGENT', municipalityId: 7 }, secret);
const viewerToken = jwt.sign({ sub: '22222222-2222-4222-8222-222222222222', role: 'VIEWER', municipalityId: 7 }, secret);
const reportId = '33333333-3333-4333-8333-333333333333';
const teamId = '44444444-4444-4444-8444-444444444444';

describe('Citizen reports API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async value => {
      if (Array.isArray(value)) return Promise.all(value);
      return value({ citizenReport: prisma.citizenReport, citizenReportMessage: prisma.citizenReportMessage });
    });
  });

  it('crée un signalement public avec jeton de suivi', async () => {
    prisma.municipality.findUnique.mockResolvedValue({ id: 7 });
    prisma.citizenReport.count.mockResolvedValue(0);
    prisma.citizenReport.create.mockResolvedValue({ id: reportId, publicNumber: 'REQ-7-0000001', status: 'RECEIVED', createdAt: new Date() });
    const response = await request(app).post('/api/v1/citizen-reports/public').send({ municipalityId: 7, category: 'ROAD', title: 'Nid-de-poule', description: 'Trou important sur la chaussée' });
    expect(response.status).toBe(201);
    expect(response.body.trackingToken).toBeDefined();
    expect(prisma.citizenReport.create).toHaveBeenCalledWith({ data: expect.objectContaining({ reporterName: null, reporterEmail: null, reporterPhone: null }) });
  });

  it('crée un signalement public avec coordonnées de contact', async () => {
    prisma.municipality.findUnique.mockResolvedValue({ id: 7 });
    prisma.citizenReport.count.mockResolvedValue(9);
    prisma.citizenReport.create.mockResolvedValue({ publicNumber: 'REQ-7-0000010', status: 'RECEIVED', createdAt: new Date() });
    const response = await request(app).post('/api/v1/citizen-reports/public').send({ municipalityId: 7, category: 'LIGHTING', title: 'Lampadaire éteint', description: 'Le lampadaire ne fonctionne plus', reporterName: 'Citoyenne Test', reporterEmail: 'citoyenne@example.com', reporterPhone: '514-555-0101', consentToContact: true });
    expect(response.status).toBe(201);
    expect(prisma.citizenReport.create).toHaveBeenCalledWith({ data: expect.objectContaining({ reporterName: 'Citoyenne Test', reporterEmail: 'citoyenne@example.com', reporterPhone: '514-555-0101' }) });
  });

  it('refuse un signalement public invalide', async () => {
    expect((await request(app).post('/api/v1/citizen-reports/public').send({ municipalityId: 0, category: 'UNKNOWN', title: 'x', description: 'x' })).status).toBe(400);
  });

  it('retourne 404 pour une municipalité inconnue', async () => {
    prisma.municipality.findUnique.mockResolvedValue(null);
    expect((await request(app).post('/api/v1/citizen-reports/public').send({ municipalityId: 99, category: 'ROAD', title: 'Nid-de-poule', description: 'Trou important sur la chaussée' })).status).toBe(404);
  });

  it('refuse le suivi public sans jeton', async () => {
    expect((await request(app).get('/api/v1/citizen-reports/public/REQ-7-0000001')).status).toBe(401);
  });

  it('retourne le suivi public avec un jeton valide', async () => {
    prisma.citizenReport.findFirst.mockResolvedValue({ publicNumber: 'REQ-7-0000001', status: 'TRIAGED', messages: [] });
    const response = await request(app).get('/api/v1/citizen-reports/public/REQ-7-0000001').set('x-cityflow-tracking-token', 'secret');
    expect(response.status).toBe(200);
  });

  it('retourne 404 avec un jeton public invalide', async () => {
    prisma.citizenReport.findFirst.mockResolvedValue(null);
    expect((await request(app).get('/api/v1/citizen-reports/public/REQ-7-0000001').set('x-cityflow-tracking-token', 'bad')).status).toBe(404);
  });

  it('refuse la liste interne sans authentification ou avec un mauvais rôle', async () => {
    expect((await request(app).get('/api/v1/citizen-reports')).status).toBe(401);
    expect((await request(app).get('/api/v1/citizen-reports').set('Authorization', `Bearer ${viewerToken}`)).status).toBe(403);
  });

  it('liste avec pagination et tous les filtres', async () => {
    prisma.citizenReport.count.mockResolvedValue(26);
    prisma.citizenReport.findMany.mockResolvedValue([{ id: reportId }]);
    const response = await request(app).get('/api/v1/citizen-reports?page=2&pageSize=10&status=TRIAGED&category=ROAD&priority=HIGH&q=nid').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({ page: 2, pageSize: 10, total: 26, totalPages: 3 });
    expect(prisma.citizenReport.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 10, take: 10 }));
  });

  it('liste avec les valeurs par défaut', async () => {
    prisma.citizenReport.count.mockResolvedValue(0);
    prisma.citizenReport.findMany.mockResolvedValue([]);
    const response = await request(app).get('/api/v1/citizen-reports').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.pagination.pageSize).toBe(25);
  });

  it('refuse des filtres internes invalides', async () => {
    expect((await request(app).get('/api/v1/citizen-reports?page=0&priority=UNKNOWN').set('Authorization', `Bearer ${token}`)).status).toBe(400);
  });

  it('retourne le détail interne ou 404', async () => {
    prisma.citizenReport.findFirst.mockResolvedValueOnce({ id: reportId }).mockResolvedValueOnce(null);
    expect((await request(app).get(`/api/v1/citizen-reports/${reportId}`).set('Authorization', `Bearer ${token}`)).status).toBe(200);
    expect((await request(app).get(`/api/v1/citizen-reports/${reportId}`).set('Authorization', `Bearer ${token}`)).status).toBe(404);
  });

  it.each(['TRIAGED', 'RESOLVED', 'CLOSED'])('trace les dates métier pour %s', async status => {
    prisma.citizenReport.findFirst.mockResolvedValue({ id: reportId, status: 'RECEIVED' });
    prisma.citizenReport.update.mockResolvedValue({ id: reportId, status });
    prisma.citizenReportMessage.create.mockResolvedValue({ id: 'message-1' });
    const response = await request(app).post(`/api/v1/citizen-reports/${reportId}/transition`).set('Authorization', `Bearer ${token}`).send({ status, priority: 'HIGH', assignedTeamId: teamId, reason: 'Mise à jour municipale' });
    expect(response.status).toBe(200);
  });

  it('refuse une transition invalide', async () => {
    expect((await request(app).post(`/api/v1/citizen-reports/${reportId}/transition`).set('Authorization', `Bearer ${token}`).send({ status: 'UNKNOWN', reason: 'x' })).status).toBe(400);
  });

  it('retourne 404 pour une transition sur signalement absent', async () => {
    prisma.citizenReport.findFirst.mockResolvedValue(null);
    expect((await request(app).post(`/api/v1/citizen-reports/${reportId}/transition`).set('Authorization', `Bearer ${token}`).send({ status: 'TRIAGED', reason: 'Prise en charge' })).status).toBe(404);
  });

  it('refuse de modifier un signalement fermé sans réouverture', async () => {
    prisma.citizenReport.findFirst.mockResolvedValue({ id: reportId, status: 'CLOSED' });
    expect((await request(app).post(`/api/v1/citizen-reports/${reportId}/transition`).set('Authorization', `Bearer ${token}`).send({ status: 'IN_PROGRESS', reason: 'Tentative interdite' })).status).toBe(409);
  });

  it('autorise la réouverture d’un signalement fermé', async () => {
    prisma.citizenReport.findFirst.mockResolvedValue({ id: reportId, status: 'CLOSED' });
    prisma.citizenReport.update.mockResolvedValue({ id: reportId, status: 'REOPENED' });
    prisma.citizenReportMessage.create.mockResolvedValue({ id: 'message-1' });
    expect((await request(app).post(`/api/v1/citizen-reports/${reportId}/transition`).set('Authorization', `Bearer ${token}`).send({ status: 'REOPENED', reason: 'Problème réapparu' })).status).toBe(200);
  });

  it.each(['PUBLIC', 'INTERNAL'])('ajoute un message %s', async visibility => {
    prisma.citizenReport.findFirst.mockResolvedValue({ id: reportId });
    prisma.citizenReportMessage.create.mockResolvedValue({ id: 'message-1', visibility });
    const response = await request(app).post(`/api/v1/citizen-reports/${reportId}/messages`).set('Authorization', `Bearer ${token}`).send({ visibility, message: 'Message municipal' });
    expect(response.status).toBe(201);
  });

  it('utilise PUBLIC par défaut pour un message', async () => {
    prisma.citizenReport.findFirst.mockResolvedValue({ id: reportId });
    prisma.citizenReportMessage.create.mockResolvedValue({ id: 'message-1' });
    const response = await request(app).post(`/api/v1/citizen-reports/${reportId}/messages`).set('Authorization', `Bearer ${token}`).send({ message: 'Information au citoyen' });
    expect(response.status).toBe(201);
    expect(prisma.citizenReportMessage.create).toHaveBeenCalledWith({ data: expect.objectContaining({ visibility: 'PUBLIC' }) });
  });

  it('refuse un message invalide ou sur signalement absent', async () => {
    expect((await request(app).post(`/api/v1/citizen-reports/${reportId}/messages`).set('Authorization', `Bearer ${token}`).send({ visibility: 'UNKNOWN', message: 'x' })).status).toBe(400);
    prisma.citizenReport.findFirst.mockResolvedValue(null);
    expect((await request(app).post(`/api/v1/citizen-reports/${reportId}/messages`).set('Authorization', `Bearer ${token}`).send({ message: 'Message valide' })).status).toBe(404);
  });
});
