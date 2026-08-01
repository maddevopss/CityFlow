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
const applicationId = '33333333-3333-4333-8333-333333333333';

describe('Permit applications API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async value => {
      if (Array.isArray(value)) return Promise.all(value);
      return value({ permitDecision: prisma.permitDecision, permitApplication: prisma.permitApplication });
    });
  });

  it('crée une demande isolée par municipalité', async () => {
    prisma.permitApplication.count.mockResolvedValue(0);
    prisma.permitApplication.create.mockResolvedValue({ id: applicationId, publicNumber: 'PER-7-000001', status: 'DRAFT' });
    const response = await request(app).post('/api/v1/permit-applications').set('Authorization', `Bearer ${agentToken}`).send({ applicantName: 'Entreprise ABC', applicantEmail: 'contact@example.com', permitType: 'CONSTRUCTION', address: '100 rue Principale', description: 'Travaux structuraux' });
    expect(response.status).toBe(201);
    expect(prisma.permitApplication.create).toHaveBeenCalledWith({ data: expect.objectContaining({ municipalityId: 7, createdBy: '11111111-1111-4111-8111-111111111111' }) });
  });

  it('refuse une décision hors transition', async () => {
    prisma.permitApplication.findFirst.mockResolvedValue({ id: applicationId, status: 'DRAFT' });
    const response = await request(app).post(`/api/v1/permit-applications/${applicationId}/decision`).set('Authorization', `Bearer ${reviewerToken}`).send({ decision: 'APPROVED', reason: 'Conforme' });
    expect(response.status).toBe(409);
  });

  it('délivre seulement une demande approuvée', async () => {
    prisma.permitApplication.findFirst.mockResolvedValue({ id: applicationId, status: 'APPROVED' });
    prisma.permitApplication.update.mockResolvedValue({ id: applicationId, status: 'ISSUED' });
    const response = await request(app).post(`/api/v1/permit-applications/${applicationId}/issue`).set('Authorization', `Bearer ${agentToken}`);
    expect(response.status).toBe(200);
  });
});
