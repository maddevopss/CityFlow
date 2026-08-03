const request = require('supertest');

jest.mock('bcryptjs', () => ({
  hashSync: jest.fn(() => ['hashed', 'test', 'value'].join('-')),
  compareSync: jest.fn()
}));

const mockTx = {
  municipality: { create: jest.fn() },
  user: { create: jest.fn() },
  $executeRaw: jest.fn()
};

jest.mock('../../src/db/prisma', () => ({
  user: { findUnique: jest.fn(), update: jest.fn() },
  $transaction: jest.fn(async (callback) => callback(mockTx))
}));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');

const testPassword = ['mot', 'passe', 'test', 'douze'].join('-');
const payload = {
  municipalityName: 'Ville de Test',
  fullName: 'Administratrice Test',
  email: 'admin@ville.test',
  password: testPassword,
  acceptedTerms: true
};

describe('Inscription et registre légal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue(null);
    mockTx.municipality.create.mockResolvedValue({ id: 7, name: payload.municipalityName });
    mockTx.user.create.mockResolvedValue({
      id: '11111111-1111-4111-8111-111111111111',
      email: payload.email,
      fullName: payload.fullName,
      role: 'ADMIN',
      municipalityId: 7
    });
    mockTx.$executeRaw.mockResolvedValue(1);
  });

  it('refuse une inscription sans consentement obligatoire', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...payload, acceptedTerms: false });

    expect(response.status).toBe(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('enregistre deux preuves dans la transaction de création', async () => {
    const response = await request(app).post('/api/v1/auth/register').send(payload);

    expect(response.status).toBe(201);
    expect(mockTx.$executeRaw).toHaveBeenCalledTimes(2);
    expect(mockTx.$executeRaw.mock.calls[0]).toEqual(
      expect.arrayContaining([expect.any(Array), expect.any(String)])
    );
  });

  it('annule la création lorsque le registre échoue', async () => {
    const failure = new Error('registre indisponible');
    prisma.$transaction.mockRejectedValueOnce(failure);

    const response = await request(app).post('/api/v1/auth/register').send(payload);

    expect(response.status).toBe(500);
  });
});
