const request = require('supertest');

jest.mock('./db/prisma', () => ({
  inspectionReminder: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn()
  },
  inspection: {
    findMany: jest.fn()
  }
}));

const prisma = require('./db/prisma');
const app = require('./app');

const reminderId = '55555555-5555-4555-8555-555555555555';

describe('sécurité des rappels d’inspection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('limite la lecture avant authentification et avant accès à la base', async () => {
    const response = await request(app).get('/api/v1/inspection-reminders');

    expect(response.status).toBe(401);
    expect(response.headers['ratelimit-limit']).toBeDefined();
    expect(prisma.inspectionReminder.findMany).not.toHaveBeenCalled();
  });

  it('limite la génération avant authentification et avant accès à la base', async () => {
    const response = await request(app).post('/api/v1/inspection-reminders/generate');

    expect(response.status).toBe(401);
    expect(response.headers['ratelimit-limit']).toBeDefined();
    expect(prisma.inspection.findMany).not.toHaveBeenCalled();
    expect(prisma.inspectionReminder.upsert).not.toHaveBeenCalled();
  });

  it('limite l’acquittement avant authentification et avant accès à la base', async () => {
    const response = await request(app).post(
      `/api/v1/inspection-reminders/${reminderId}/acknowledge`
    );

    expect(response.status).toBe(401);
    expect(response.headers['ratelimit-limit']).toBeDefined();
    expect(prisma.inspectionReminder.findFirst).not.toHaveBeenCalled();
    expect(prisma.inspectionReminder.update).not.toHaveBeenCalled();
  });
});
