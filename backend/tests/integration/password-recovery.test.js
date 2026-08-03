const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn()
  }
};
const mockSendMail = jest.fn();
const mockCreateTransport = jest.fn(() => ({ sendMail: mockSendMail }));

jest.mock('../../src/db/prisma', () => mockPrisma);
jest.mock('nodemailer', () => ({ createTransport: mockCreateTransport }));
jest.mock('../../src/config', () => ({ jwtSecret: 'test-secret-cityflow-at-least-32-characters' }));
jest.mock('../../src/api/middleware/rateLimiters', () => ({
  loginLimiter: (req, res, next) => next()
}));

const router = require('../../src/api/routes/passwordRecovery');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(router);
  return app;
}

const smtpVariables = {
  SMTP_HOST: 'mail.smtp2go.com',
  SMTP_PORT: '587',
  SMTP_SECURE: 'false',
  SMTP_USER: 'smtp2go-test-user',
  SMTP_PASSWORD: 'smtp2go-test-password',
  MAIL_FROM: 'CityFlow <no-reply@example.invalid>',
  PUBLIC_APP_URL: 'https://cityflow.example.invalid'
};

const resetPassword = ['mot', 'passe', 'test', 'douze'].join('-');

describe('password recovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(process.env, smtpVariables);
  });

  afterEach(() => {
    for (const name of Object.keys(smtpVariables)) delete process.env[name];
  });

  test('retourne une réponse générique pour un utilisateur inexistant', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const response = await request(createApp())
      .post('/forgot-password')
      .send({ email: 'absent@example.invalid' });

    expect(response.status).toBe(202);
    expect(response.body).toEqual({
      message: 'Si un compte correspond, les instructions ont été envoyées'
    });
    expect(mockCreateTransport).not.toHaveBeenCalled();
  });

  test('utilise SMTP2GO et génère un jeton sans donnée du mot de passe', async () => {
    const updatedAt = new Date('2026-08-03T12:00:00.000Z');
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'f2ef70de-e292-48d4-bd94-ec50d2f5ecab',
      email: 'active@example.invalid',
      isActive: true,
      updatedAt
    });
    mockSendMail.mockResolvedValue({ messageId: 'test-message' });

    const response = await request(createApp())
      .post('/forgot-password')
      .send({ email: 'active@example.invalid' });

    expect(response.status).toBe(202);
    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: 'mail.smtp2go.com',
      port: 587,
      secure: false,
      auth: {
        user: 'smtp2go-test-user',
        pass: 'smtp2go-test-password'
      }
    });

    const message = mockSendMail.mock.calls[0][0];
    const token = message.text.split('/reset-password/')[1];
    const payload = jwt.verify(token, 'test-secret-cityflow-at-least-32-characters');

    expect(payload).toMatchObject({
      sub: 'f2ef70de-e292-48d4-bd94-ec50d2f5ecab',
      purpose: 'password-reset',
      userVersion: updatedAt.toISOString()
    });
    expect(payload).not.toHaveProperty('fingerprint');
  });

  test('réinitialise le mot de passe avec une version utilisateur valide', async () => {
    const updatedAt = new Date('2026-08-03T12:00:00.000Z');
    const user = {
      id: 'f2ef70de-e292-48d4-bd94-ec50d2f5ecab',
      isActive: true,
      updatedAt
    };
    mockPrisma.user.findUnique.mockResolvedValue(user);
    mockPrisma.user.update.mockResolvedValue({ ...user, updatedAt: new Date() });
    const token = jwt.sign(
      { sub: user.id, purpose: 'password-reset', userVersion: updatedAt.toISOString() },
      'test-secret-cityflow-at-least-32-characters',
      { expiresIn: '30m' }
    );

    const response = await request(createApp()).post('/reset-password').send({
      token,
      password: resetPassword,
      passwordConfirmation: resetPassword
    });

    expect(response.status).toBe(204);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { password: expect.any(String) }
    });
  });
});
