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
const app = require('../../src/app');

describe('Auth API', () => {
  const user = {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'agent@ville.test',
    password: 'hash',
    role: 'MUNICIPAL_AGENT',
    municipalityId: 7,
    fullName: 'Agent municipal'
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

  it('connecte un utilisateur valide et inscrit la dernière connexion', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    prisma.user.update.mockResolvedValue(user);
    bcrypt.compareSync.mockReturnValue(true);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'valide' });

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: user.id, email: user.email, role: user.role });
    expect(jwt.verify(res.body.token, process.env.JWT_SECRET || 'test-secret')).toEqual(
      expect.objectContaining({ sub: user.id, municipalityId: 7 })
    );
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { lastLogin: expect.any(Date) }
    });
  });

  it('retourne le profil associé au jeton', async () => {
    const token = jwt.sign(
      { sub: user.id, role: user.role, municipalityId: 7 },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
    prisma.user.findUnique.mockResolvedValue({
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
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: user.id },
      select: { id: true, email: true, fullName: true, role: true, municipalityId: true }
    });
  });
});
