const request = require('supertest');

jest.mock('bcryptjs', () => ({ compareSync: jest.fn() }));

jest.mock('../../src/db/prisma', () => {
  const mockUserFindUnique = jest.fn();
  const mockUserUpdate = jest.fn();
  const mockExecuteRaw = jest.fn();
  const mockQueryRaw = jest.fn();
  const mockTransactionClient = {
    user: {
      findUnique: mockUserFindUnique,
      update: mockUserUpdate
    },
    $executeRaw: mockExecuteRaw,
    $queryRaw: mockQueryRaw
  };

  return {
    user: {
      findUnique: mockUserFindUnique,
      update: mockUserUpdate
    },
    inspection: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn()
    },
    $executeRaw: mockExecuteRaw,
    $queryRaw: mockQueryRaw,
    $transaction: jest.fn(callback => callback(mockTransactionClient))
  };
});

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../src/db/prisma');
const config = require('../../src/config');
const app = require('../../src/app');

function signToken(payload, overrides = {}) {
  return jwt.sign(payload, config.jwtSecret, {
    algorithm: config.jwtAlgorithm,
    expiresIn: '1h',
    issuer: config.jwtIssuer,
    audience: config.jwtAudience,
    ...overrides
  });
}

describe('Auth API', () => {
  const user = {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'agent@ville.test',
    password: 'hash',
    role: 'MUNICIPAL_AGENT',
    municipalityId: 7,
    fullName: 'Agent municipal',
    isActive: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(callback => callback({
      user: {
        findUnique: prisma.user.findUnique,
        update: prisma.user.update
      },
      $executeRaw: prisma.$executeRaw,
      $queryRaw: prisma.$queryRaw
    }));
  });

  it('refuse un utilisateur inconnu sans comparer le mot de passe', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'absent@ville.test', password: 'secret' });

    expect(res.status).toBe(401);
    expect(bcrypt.compareSync).not.toHaveBeenCalled();
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
  });

  it('refuse un mot de passe invalide', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    bcrypt.compareSync.mockReturnValue(false);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'mauvais' });

    expect(res.status).toBe(401);
    expect(bcrypt.compareSync).toHaveBeenCalledWith('mauvais', 'hash');
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
  });

  it('refuse un utilisateur désactivé avec un message générique', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...user, isActive: false });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'valide' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Identifiants invalides' });
    expect(bcrypt.compareSync).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
  });

  it('crée une session et un refresh token avec le contrat JWT attendu', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    prisma.user.update.mockResolvedValue(user);
    prisma.$executeRaw.mockResolvedValue(1);
    bcrypt.compareSync.mockReturnValue(true);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'valide' });

    expect(res.status).toBe(200);
    expect(res.body.refreshToken).toEqual(expect.any(String));
    expect(res.body.refreshToken.length).toBeGreaterThanOrEqual(32);
    const decoded = jwt.verify(res.body.token, config.jwtSecret, {
      algorithms: [config.jwtAlgorithm],
      issuer: config.jwtIssuer,
      audience: config.jwtAudience
    });
    expect(decoded).toEqual(expect.objectContaining({
      sub: user.id,
      municipalityId: 7,
      jti: expect.any(String)
    }));
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { lastLogin: expect.any(Date) }
    });
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(3);
  });

  it('fait tourner un refresh token une seule fois', async () => {
    const refreshToken = 'ancien-refresh-token-valide-1234567890';
    prisma.$queryRaw.mockResolvedValue([{ user_id: user.id }]);
    prisma.user.findUnique.mockResolvedValue(user);
    prisma.$executeRaw.mockResolvedValue(1);

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.refreshToken).toEqual(expect.any(String));
    expect(res.body.refreshToken).not.toBe(refreshToken);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(3);
  });

  it('refuse un refresh token déjà utilisé ou révoqué', async () => {
    prisma.$queryRaw.mockResolvedValue([]);

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'refresh-token-consomme-123456789012345' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Jeton de renouvellement invalide' });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
  });

  it('refuse la rotation pour un compte désactivé', async () => {
    prisma.$queryRaw.mockResolvedValue([{ user_id: user.id }]);
    prisma.user.findUnique.mockResolvedValue({ ...user, isActive: false });

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'refresh-token-compte-desactive-12345678' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Session invalide' });
  });

  it('retourne le profil associé à un ancien jeton conforme en environnement de test', async () => {
    const token = signToken({ sub: user.id, role: user.role, municipalityId: 7 });
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: user.id, role: user.role, municipalityId: 7, isActive: true })
      .mockResolvedValueOnce({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        municipalityId: 7
      });

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(user.email);
  });

  it('refuse une session persistante révoquée', async () => {
    const token = signToken(
      { sub: user.id, role: user.role, municipalityId: 7 },
      { jwtid: '33333333-3333-4333-8333-333333333333' }
    );
    prisma.user.findUnique.mockResolvedValue({ id: user.id, role: user.role, municipalityId: 7, isActive: true });
    prisma.$queryRaw.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Session invalide' });
  });

  it('révoque la session active lors de la déconnexion', async () => {
    const token = signToken(
      { sub: user.id, role: user.role, municipalityId: 7 },
      { jwtid: '33333333-3333-4333-8333-333333333333' }
    );
    prisma.user.findUnique.mockResolvedValue({ id: user.id, role: user.role, municipalityId: 7, isActive: true });
    prisma.$queryRaw.mockResolvedValue([{ id: 'session-id' }]);
    prisma.$executeRaw.mockResolvedValue(1);

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['algorithme inattendu', { algorithm: 'HS384' }],
    ['émetteur inattendu', { issuer: 'service-inconnu' }],
    ['audience inattendue', { audience: 'autre-api' }],
    ['jeton expiré', { expiresIn: '-1s' }]
  ])('refuse un %s avant tout accès utilisateur', async (_label, overrides) => {
    const token = signToken(
      { sub: user.id, role: user.role, municipalityId: 7 },
      overrides
    );

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Token invalide' });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('refuse un jeton existant après la désactivation du compte', async () => {
    const token = signToken({ sub: user.id, role: user.role, municipalityId: 7 });
    prisma.user.findUnique.mockResolvedValue({ id: user.id, role: user.role, municipalityId: 7, isActive: false });

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Session invalide' });
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
  });

  it('établit le contexte depuis la base malgré des revendications JWT différentes', async () => {
    const token = signToken({ sub: user.id, role: 'ADMIN', municipalityId: 99 });
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: user.id, role: user.role, municipalityId: 7, isActive: true })
      .mockResolvedValueOnce({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        municipalityId: 7
      });

    const res = await request(app)
      .get('/api/v1/auth/me?municipalityId=99')
      .set('Authorization', `Bearer ${token}`)
      .send({ municipalityId: 99 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ role: user.role, municipalityId: 7 }));
  });

  it('refuse un utilisateur sans municipalité', async () => {
    const token = signToken({ sub: user.id, role: user.role, municipalityId: 7 });
    prisma.user.findUnique.mockResolvedValue({ id: user.id, role: user.role, municipalityId: null, isActive: true });

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Session invalide' });
  });
});
