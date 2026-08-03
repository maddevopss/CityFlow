jest.mock('../../src/db/prisma', () => ({ roadEvent: { findMany: jest.fn() } }));
const prisma = require('../../src/db/prisma');
const request = require('supertest');
const app = require('../../src/app');

describe('export GeoJSON', () => {
  beforeEach(() => jest.clearAllMocks());

  test('applique une limite explicite aux résultats', async () => {
    prisma.roadEvent.findMany.mockResolvedValue([]);
    const response = await request(app).get('/api/v1/exports/geojson?municipalityId=7&limit=25');
    expect(response.status).toBe(200);
    expect(prisma.roadEvent.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 25 }));
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  test('refuse une limite hors bornes', async () => {
    const response = await request(app).get('/api/v1/exports/geojson?municipalityId=7&limit=1001');
    expect(response.status).toBe(400);
    expect(prisma.roadEvent.findMany).not.toHaveBeenCalled();
  });
});
