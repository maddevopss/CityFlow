const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/db/prisma', () => ({
  $queryRawUnsafe: jest.fn(),
  $executeRawUnsafe: jest.fn()
}));

const prisma = require('../../src/db/prisma');
const app = require('../../src/app');

describe('Public works assignments API', () => {
  const secret = process.env.JWT_SECRET || 'test-secret';
  const workOrderId = '33333333-3333-4333-8333-333333333333';
  const teamId = '44444444-4444-4444-8444-444444444444';
  const vehicleId = '55555555-5555-4555-8555-555555555555';
  const actorId = '11111111-1111-4111-8111-111111111111';
  const agentToken = jwt.sign(
    { sub: actorId, role: 'MUNICIPAL_AGENT', municipalityId: 7 },
    secret,
    { expiresIn: '1h' }
  );
  const viewerToken = jwt.sign(
    { sub: actorId, role: 'VIEWER', municipalityId: 7 },
    secret,
    { expiresIn: '1h' }
  );
  const noMunicipalityToken = jwt.sign(
    { sub: actorId, role: 'ADMIN' },
    secret,
    { expiresIn: '1h' }
  );

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$executeRawUnsafe.mockResolvedValue(1);
  });

  it('liste les équipes et les véhicules de la municipalité', async () => {
    prisma.$queryRawUnsafe
      .mockResolvedValueOnce([{ id: teamId, status: 'ACTIVE' }])
      .mockResolvedValueOnce([{ id: vehicleId, status: 'AVAILABLE' }]);

    const teams = await request(app)
      .get('/api/v1/public-works/teams')
      .set('Authorization', `Bearer ${viewerToken}`);
    const vehicles = await request(app)
      .get('/api/v1/public-works/vehicles')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(teams.status).toBe(200);
    expect(teams.body.items).toHaveLength(1);
    expect(vehicles.status).toBe(200);
    expect(vehicles.body.items).toHaveLength(1);
  });

  it('exige une municipalité pour consulter les ressources', async () => {
    const teams = await request(app)
      .get('/api/v1/public-works/teams')
      .set('Authorization', `Bearer ${noMunicipalityToken}`);
    const vehicles = await request(app)
      .get('/api/v1/public-works/vehicles')
      .set('Authorization', `Bearer ${noMunicipalityToken}`);

    expect(teams.status).toBe(403);
    expect(vehicles.status).toBe(403);
    expect(prisma.$queryRawUnsafe).not.toHaveBeenCalled();
  });

  it('refuse les données invalides et une équipe nulle', async () => {
    const invalidId = await request(app)
      .post('/api/v1/public-works/work-orders/invalide/assign')
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ teamId });
    const missingTeam = await request(app)
      .post(`/api/v1/public-works/work-orders/${workOrderId}/assign`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ vehicleId });
    const nullTeam = await request(app)
      .post(`/api/v1/public-works/work-orders/${workOrderId}/assign`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ teamId: null });

    expect(invalidId.status).toBe(400);
    expect(missingTeam.status).toBe(400);
    expect(nullTeam.status).toBe(400);
    expect(prisma.$queryRawUnsafe).not.toHaveBeenCalled();
  });

  it('refuse un rôle en lecture seule pour l’affectation', async () => {
    const response = await request(app)
      .post(`/api/v1/public-works/work-orders/${workOrderId}/assign`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ teamId });

    expect(response.status).toBe(403);
    expect(prisma.$queryRawUnsafe).not.toHaveBeenCalled();
  });

  it('traduit les erreurs métier du service', async () => {
    prisma.$queryRawUnsafe.mockResolvedValueOnce([]);
    const missingOrder = await request(app)
      .post(`/api/v1/public-works/work-orders/${workOrderId}/assign`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ teamId });

    prisma.$queryRawUnsafe
      .mockResolvedValueOnce([{ id: workOrderId, status: 'OPEN' }])
      .mockResolvedValueOnce([]);
    const unavailableTeam = await request(app)
      .post(`/api/v1/public-works/work-orders/${workOrderId}/assign`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ teamId });

    prisma.$queryRawUnsafe
      .mockResolvedValueOnce([{ id: workOrderId, status: 'OPEN' }])
      .mockResolvedValueOnce([{ id: teamId }])
      .mockResolvedValueOnce([]);
    const unavailableVehicle = await request(app)
      .post(`/api/v1/public-works/work-orders/${workOrderId}/assign`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ teamId, vehicleId });

    expect(missingOrder.status).toBe(404);
    expect(unavailableTeam.status).toBe(409);
    expect(unavailableVehicle.status).toBe(409);
  });

  it('affecte un ordre à une équipe et à un véhicule', async () => {
    const assigned = {
      id: workOrderId,
      status: 'ASSIGNED',
      assignedTeamId: teamId,
      assignedVehicleId: vehicleId
    };
    prisma.$queryRawUnsafe
      .mockResolvedValueOnce([{ id: workOrderId, status: 'OPEN' }])
      .mockResolvedValueOnce([{ id: teamId }])
      .mockResolvedValueOnce([{ id: vehicleId }])
      .mockResolvedValueOnce([assigned]);

    const response = await request(app)
      .post(`/api/v1/public-works/work-orders/${workOrderId}/assign`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ teamId, vehicleId, ignored: true });

    expect(response.status).toBe(200);
    expect(response.body.item).toEqual(assigned);
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledTimes(2);
  });

  it('transmet les erreurs inattendues au gestionnaire global', async () => {
    prisma.$queryRawUnsafe.mockRejectedValueOnce(new Error('base indisponible'));

    const response = await request(app)
      .post(`/api/v1/public-works/work-orders/${workOrderId}/assign`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ teamId });

    expect(response.status).toBe(500);
  });
});
