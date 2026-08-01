const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({ inspection: { findFirst: jest.fn() } }));
const prisma = require('../../src/db/prisma');
const app = require('../../src/app');

const secret = process.env.JWT_SECRET || 'test-secret';
const token = jwt.sign({ sub: '11111111-1111-4111-8111-111111111111', role: 'MUNICIPAL_AGENT', municipalityId: 7 }, secret, { expiresIn: '1h' });
const inspectionId = '33333333-3333-4333-8333-333333333333';

describe('Inspection notifications API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('prévisualise une notification externe', async () => {
    prisma.inspection.findFirst.mockResolvedValue({ id: inspectionId, address: '10 rue Principale', scheduledAt: new Date(), status: 'SCHEDULED' });
    const res = await request(app)
      .post('/api/v1/inspection-notifications/dispatch')
      .set('Authorization', `Bearer ${token}`)
      .send({ inspectionId, channel: 'EMAIL', recipient: 'inspecteur@example.com', template: 'REMINDER', dryRun: true });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('PREVIEWED');
  });

  it('refuse un canal inconnu', async () => {
    const res = await request(app)
      .post('/api/v1/inspection-notifications/dispatch')
      .set('Authorization', `Bearer ${token}`)
      .send({ inspectionId, channel: 'FAX', recipient: 'x', template: 'REMINDER' });
    expect(res.status).toBe(400);
  });
});
