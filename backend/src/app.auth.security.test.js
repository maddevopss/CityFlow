const request = require('supertest');
const app = require('./app');

describe('sécurité de l’authentification', () => {
  it('refuse un corps de connexion invalide avant la base de données', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'invalide',
      password: 'court'
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Identifiants invalides' });
    expect(response.headers['ratelimit-limit']).toBeDefined();
  });

  it('limite la restauration avant de refuser un jeton manquant', async () => {
    const response = await request(app).get('/api/v1/auth/me');

    expect(response.status).toBe(401);
    expect(response.headers['ratelimit-limit']).toBeDefined();
  });
});
