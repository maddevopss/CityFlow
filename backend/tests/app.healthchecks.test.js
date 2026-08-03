/* eslint-env jest */

const request = require('supertest');

jest.mock('../src/db/prisma', () => ({
  $queryRaw: jest.fn()
}));

const prisma = require('../src/db/prisma');
const app = require('../src/app');

describe('contrat des healthchecks', () => {
  beforeEach(() => {
    prisma.$queryRaw.mockReset();
  });

  it('retourne 200 pour la sonde de vie sans accès à la base', async () => {
    const response = await request(app).get('/health/live');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({ status: 'ok', service: 'cityflow-backend' }));
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('retourne 200 lorsque la base est disponible', async () => {
    prisma.$queryRaw.mockResolvedValue([{ result: 1 }]);

    const response = await request(app).get('/health/ready');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({ status: 'ready', service: 'cityflow-backend' }));
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('retourne 503 sans exposer l’erreur lorsque la base est indisponible', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('database unavailable'));

    const response = await request(app).get('/health/ready');

    expect(response.status).toBe(503);
    expect(response.body).toEqual(expect.objectContaining({ status: 'not_ready', service: 'cityflow-backend' }));
    expect(JSON.stringify(response.body)).not.toContain('database unavailable');
  });
});
