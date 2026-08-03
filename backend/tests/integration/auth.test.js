const request = require('supertest');

jest.mock('bcryptjs', () => ({ compareSync: jest.fn() }));

jest.mock('../../src/db/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    update: jest.fn()
  },
  inspection: {
    findMany: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn()
  }
}));

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
  });

  it('refuse un utilisateur inconnu sans comparer le mot de passe', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'absent@ville.test', password: 'secret' });

    expect(res.status).toBe(401);
    expect(bcrypt.compareSync).not.toHaveBeenCalled();
  });

  it('refuse un mot de passe invalide', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    bcrypt.compareSync.mockReturnValue(false);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'mauvais' });

    expect(res.status).toBe(401);
    expect(bcrypt.compareSync).toHaveBeenCalledWith('mauvais', 'hash');
  });

  it('refuse un utilisateur désactivé avec un message générique', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...user, isActive: false });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'valide' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Identifiants invalides' });
    expect(bcrypt.compareSync).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('connecte un utilisateur valide avec le contrat JWT attendu', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    prisma.user.update.mockResolvedValue(user);
    bcrypt.compareSync.mockReturnValue(true);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'valide' });

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: user.id, email: user.email, role: user.role });
    expect(
      jwt.verify(res.body.token, config.jwtSecret, {
        algorithms: [config.jwtAlgorithm],
        issuer: config.jwtIssuer,
        audience: config.jwtAudience
      })
    ).toEqual(expect.objectContaining({ sub: user.id, municipalityId: 7 }));
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { lastLogin: expect.any(Date) }
    });
  });

  it('retourne le profil associé à un jeton conforme', async () => {
    const token = signToken({ sub: user.id, role: user.role, municipalityId: 7 });
    prisma.user.findUnique
      .mockResolvedValueOnce({ isActive: true })
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
    prisma.user.findUnique.mockResolvedValue({ isActive: false });

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Session invalide' });
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
  });
});
