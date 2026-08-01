const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  permitApplication: { count: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  permitDecision: { create: jest.fn() },
  $transaction: jest.fn()
}));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');

const secret = process.env.JWT_SECRET || 'test-secret';
const agentToken = jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', role: 'MUNICIPAL_AGENT', municipalityId: 7 }, secret);
const reviewerToken = jwt.sign({ sub: '22222222-2222-4222-8222-222222222222', role: 'PERMIT_REVIEWER', municipalityId: 7 }, secret);
const viewerToken = jwt.sign({ sub: '44444444-4444-4444-8444-444444444444', role: 'VIEWER', municipalityId: 7 }, secret);
const applicationId = '33333333-3333-4333-8333-333333333333';

describe('Permit applications API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async value => {
      if (Array.isArray(value)) return Promise.all(value);
      return value({ permitDecision: prisma.permitDecision, permitApplication: prisma.permitApplication });
    });
  });

  it('refuse une requête non authentifiée', async () => {
    expect((await request(app).get('/api/v1/permit-applications')).status).toBe(401);
  });

  it('refuse un rôle sans accès', async () => {
    expect((await request(app).get('/api/v1/permit-applications').set('Authorization', `Bearer ${viewerToken}`)).status).toBe(403);
  });

  it('liste avec pagination, statut et recherche', async () => {
    prisma.permitApplication.count.mockResolvedValue(26);
    prisma.permitApplication.findMany.mockResolvedValue([{ id: applicationId }]);
    const response = await request(app)
      .get('/api/v1/permit-applications?page=2&pageSize=10&status=SUBMITTED&q=Principale')
      .set('Authorization', `Bearer ${agentToken}`);
    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({ page: 2, pageSize: 10, total: 26, totalPages: 3 });
    expect(prisma.permitApplication.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 10, take: 10 }));
  });

  it('liste sans filtres avec les valeurs par défaut', async () => {
    prisma.permitApplication.count.mockResolvedValue(0);
    prisma.permitApplication.findMany.mockResolvedValue([]);
    const response = await request(app).get('/api/v1/permit-applications').set('Authorization', `Bearer ${agentToken}`);
    expect(response.status).toBe(200);
    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.pageSize).toBe(25);
  });

  it('refuse des filtres invalides', async () => {
    const response = await request(app).get('/api/v1/permit-applications?page=0&status=UNKNOWN').set('Authorization', `Bearer ${agentToken}`);
    expect(response.status).toBe(400);
  });

  it('crée une demande isolée par municipalité', async () => {
    prisma.permitApplication.count.mockResolvedValue(0);
    prisma.permitApplication.create.mockResolvedValue({ id: applicationId, publicNumber: 'PER-7-000001', status: 'DRAFT' });
    const response = await request(app).post('/api/v1/permit-applications').set('Authorization', `Bearer ${agentToken}`).send({ applicantName: 'Entreprise ABC', applicantEmail: 'contact@example.com', permitType: 'CONSTRUCTION', address: '100 rue Principale', description: 'Travaux structuraux' });
    expect(response.status).toBe(201);
    expect(prisma.permitApplication.create).toHaveBeenCalledWith({ data: expect.objectContaining({ municipalityId: 7, publicNumber: 'PER-7-000001', createdBy: '11111111-1111-4111-8111-111111111111' }) });
  });

  it('refuse une création invalide', async () => {
    const response = await request(app).post('/api/v1/permit-applications').set('Authorization', `Bearer ${agentToken}`).send({ applicantName: 'x', applicantEmail: 'invalide' });
    expect(response.status).toBe(400);
    expect(prisma.permitApplication.create).not.toHaveBeenCalled();
  });

  it('retourne une demande détaillée', async () => {
    prisma.permitApplication.findFirst.mockResolvedValue({ id: applicationId, municipalityId: 7 });
    const response = await request(app).get(`/api/v1/permit-applications/${applicationId}`).set('Authorization', `Bearer ${agentToken}`);
    expect(response.status).toBe(200);
  });

  it('refuse un identifiant de détail invalide', async () => {
    expect((await request(app).get('/api/v1/permit-applications/invalide').set('Authorization', `Bearer ${agentToken}`)).status).toBe(400);
  });

  it('retourne 404 pour une demande absente', async () => {
    prisma.permitApplication.findFirst.mockResolvedValue(null);
    expect((await request(app).get(`/api/v1/permit-applications/${applicationId}`).set('Authorization', `Bearer ${agentToken}`)).status).toBe(404);
  });

  it.each(['DRAFT', 'INFORMATION_REQUIRED'])('soumet une demande en état %s', async status => {
    prisma.permitApplication.findFirst.mockResolvedValue({ id: applicationId, status });
    prisma.permitApplication.update.mockResolvedValue({ id: applicationId, status: 'SUBMITTED' });
    const response = await request(app).post(`/api/v1/permit-applications/${applicationId}/submit`).set('Authorization', `Bearer ${agentToken}`);
    expect(response.status).toBe(200);
  });

  it('retourne 404 à la soumission si la demande est absente', async () => {
    prisma.permitApplication.findFirst.mockResolvedValue(null);
    expect((await request(app).post(`/api/v1/permit-applications/${applicationId}/submit`).set('Authorization', `Bearer ${agentToken}`)).status).toBe(404);
  });

  it('refuse une soumission hors transition', async () => {
    prisma.permitApplication.findFirst.mockResolvedValue({ id: applicationId, status: 'ISSUED' });
    expect((await request(app).post(`/api/v1/permit-applications/${applicationId}/submit`).set('Authorization', `Bearer ${agentToken}`)).status).toBe(409);
  });

  it('refuse une décision hors transition', async () => {
    prisma.permitApplication.findFirst.mockResolvedValue({ id: applicationId, status: 'DRAFT' });
    const response = await request(app).post(`/api/v1/permit-applications/${applicationId}/decision`).set('Authorization', `Bearer ${reviewerToken}`).send({ decision: 'APPROVED', reason: 'Conforme' });
    expect(response.status).toBe(409);
  });

  it('refuse une décision invalide', async () => {
    const response = await request(app).post(`/api/v1/permit-applications/${applicationId}/decision`).set('Authorization', `Bearer ${reviewerToken}`).send({ decision: 'UNKNOWN', reason: 'x' });
    expect(response.status).toBe(400);
  });

  it('retourne 404 pour une décision sur demande absente', async () => {
    prisma.permitApplication.findFirst.mockResolvedValue(null);
    const response = await request(app).post(`/api/v1/permit-applications/${applicationId}/decision`).set('Authorization', `Bearer ${reviewerToken}`).send({ decision: 'REJECTED', reason: 'Dossier incomplet' });
    expect(response.status).toBe(404);
  });

  it.each(['SUBMITTED', 'UNDER_REVIEW'])('enregistre une décision depuis %s', async status => {
    prisma.permitApplication.findFirst.mockResolvedValue({ id: applicationId, status });
    prisma.permitDecision.create.mockResolvedValue({ id: 'decision-1' });
    prisma.permitApplication.update.mockResolvedValue({ id: applicationId, status: 'APPROVED' });
    const response = await request(app).post(`/api/v1/permit-applications/${applicationId}/decision`).set('Authorization', `Bearer ${reviewerToken}`).send({ decision: 'APPROVED', reason: 'Conforme', conditions: ['Inspection finale'], expiresAt: '2027-08-01T00:00:00.000Z' });
    expect(response.status).toBe(200);
    expect(prisma.permitDecision.create).toHaveBeenCalled();
  });

  it('délivre seulement une demande approuvée', async () => {
    prisma.permitApplication.findFirst.mockResolvedValue({ id: applicationId, status: 'APPROVED' });
    prisma.permitApplication.update.mockResolvedValue({ id: applicationId, status: 'ISSUED' });
    const response = await request(app).post(`/api/v1/permit-applications/${applicationId}/issue`).set('Authorization', `Bearer ${agentToken}`);
    expect(response.status).toBe(200);
  });

  it('retourne 404 à la délivrance si la demande est absente', async () => {
    prisma.permitApplication.findFirst.mockResolvedValue(null);
    expect((await request(app).post(`/api/v1/permit-applications/${applicationId}/issue`).set('Authorization', `Bearer ${agentToken}`)).status).toBe(404);
  });

  it('refuse la délivrance d’une demande non approuvée', async () => {
    prisma.permitApplication.findFirst.mockResolvedValue({ id: applicationId, status: 'SUBMITTED' });
    expect((await request(app).post(`/api/v1/permit-applications/${applicationId}/issue`).set('Authorization', `Bearer ${agentToken}`)).status).toBe(409);
  });
});
