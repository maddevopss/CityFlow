const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('./db/prisma', () => ({
  user: {
    findUnique: jest.fn()
  },
  notification: {
    count: jest.fn(),
    findMany: jest.fn()
  },
  $transaction: jest.fn()
}));

const prisma = require('./db/prisma');
const config = require('./config');
const app = require('./app');

describe('sécurité des notifications', () => {
  const userId = '11111111-1111-4111-8111-111111111111';
  const municipalityId = 7;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue({
      id: userId,
      role: 'MUNICIPAL_AGENT',
      municipalityId,
      isActive: true
    });
    prisma.notification.count.mockReturnValue(Promise.resolve(1));
    prisma.notification.findMany.mockReturnValue(Promise.resolve([{ id: 'notification-1' }]));
    prisma.$transaction.mockResolvedValue([1, [{ id: 'notification-1' }]]);
  });

  it('limite les requêtes avant de refuser une session absente', async () => {
    const response = await request(app).get('/api/v1/notifications');

    expect(response.status).toBe(401);
    expect(response.headers['ratelimit-limit']).toBeDefined();
  });

  it('isole les notifications par utilisateur et municipalité', async () => {
    const token = jwt.sign(
      { sub: userId, role: 'MUNICIPAL_AGENT', municipalityId },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    const response = await request(app)
      .get('/api/v1/notifications?status=PENDING&page=1&pageSize=25')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(prisma.notification.count).toHaveBeenCalledWith({
      where: {
        municipalityId,
        recipientId: userId,
        status: 'PENDING'
      }
    });
    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          municipalityId,
          recipientId: userId,
          status: 'PENDING'
        },
        skip: 0,
        take: 25
      })
    );
  });
});
