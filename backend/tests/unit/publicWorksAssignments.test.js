const {
  listTeams,
  listVehicles,
  assignWorkOrder
} = require('../../src/services/publicWorksAssignments');

function createDb({ queryResults = [], executeResult = 1 } = {}) {
  const $queryRawUnsafe = jest.fn();
  for (const result of queryResults) $queryRawUnsafe.mockResolvedValueOnce(result);
  return {
    $queryRawUnsafe,
    $executeRawUnsafe: jest.fn().mockResolvedValue(executeResult)
  };
}

describe('public works assignments service', () => {
  const municipalityId = 7;
  const workOrderId = '33333333-3333-4333-8333-333333333333';
  const teamId = '44444444-4444-4444-8444-444444444444';
  const vehicleId = '55555555-5555-4555-8555-555555555555';
  const actorId = '11111111-1111-4111-8111-111111111111';

  it('liste les équipes et les véhicules de la municipalité', async () => {
    const db = createDb({ queryResults: [[{ id: teamId }], [{ id: vehicleId }]] });

    await expect(listTeams(db, municipalityId)).resolves.toEqual([{ id: teamId }]);
    await expect(listVehicles(db, municipalityId)).resolves.toEqual([{ id: vehicleId }]);

    expect(db.$queryRawUnsafe).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('PublicWorksTeam'),
      municipalityId
    );
    expect(db.$queryRawUnsafe).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('PublicWorksVehicle'),
      municipalityId
    );
  });

  it('refuse une affectation sans équipe', async () => {
    const db = createDb();

    await expect(assignWorkOrder(db, {
      municipalityId,
      workOrderId,
      teamId: null,
      vehicleId: null,
      actorId
    })).rejects.toMatchObject({ message: 'team required', statusCode: 400 });

    expect(db.$queryRawUnsafe).not.toHaveBeenCalled();
  });

  it('retourne 404 lorsque l’ordre est absent', async () => {
    const db = createDb({ queryResults: [[]] });

    await expect(assignWorkOrder(db, {
      municipalityId,
      workOrderId,
      teamId,
      vehicleId: null,
      actorId
    })).rejects.toMatchObject({ message: 'work order not found', statusCode: 404 });
  });

  it('refuse une équipe inactive ou externe', async () => {
    const db = createDb({ queryResults: [[{ id: workOrderId, status: 'OPEN' }], []] });

    await expect(assignWorkOrder(db, {
      municipalityId,
      workOrderId,
      teamId,
      vehicleId: null,
      actorId
    })).rejects.toMatchObject({ message: 'team not available', statusCode: 409 });
  });

  it('refuse un véhicule indisponible ou externe', async () => {
    const db = createDb({
      queryResults: [[{ id: workOrderId, status: 'OPEN' }], [{ id: teamId }], []]
    });

    await expect(assignWorkOrder(db, {
      municipalityId,
      workOrderId,
      teamId,
      vehicleId,
      actorId
    })).rejects.toMatchObject({ message: 'vehicle not available', statusCode: 409 });
  });

  it('affecte avec une équipe sans véhicule', async () => {
    const assigned = { id: workOrderId, status: 'ASSIGNED', assignedTeamId: teamId, assignedVehicleId: null };
    const db = createDb({
      queryResults: [[{ id: workOrderId, status: 'OPEN' }], [{ id: teamId }], [assigned]]
    });

    await expect(assignWorkOrder(db, {
      municipalityId,
      workOrderId,
      teamId,
      vehicleId: null,
      actorId
    })).resolves.toEqual(assigned);

    expect(db.$executeRawUnsafe).toHaveBeenCalledTimes(2);
    expect(db.$executeRawUnsafe.mock.calls[0]).toEqual(expect.arrayContaining([
      expect.stringContaining('UPDATE "WorkOrder"'),
      teamId,
      null,
      workOrderId,
      municipalityId
    ]));
  });

  it('affecte avec une équipe et un véhicule disponible', async () => {
    const assigned = { id: workOrderId, status: 'ASSIGNED', assignedTeamId: teamId, assignedVehicleId: vehicleId };
    const db = createDb({
      queryResults: [
        [{ id: workOrderId, status: 'OPEN' }],
        [{ id: teamId }],
        [{ id: vehicleId }],
        [assigned]
      ]
    });

    await expect(assignWorkOrder(db, {
      municipalityId,
      workOrderId,
      teamId,
      vehicleId,
      actorId
    })).resolves.toEqual(assigned);

    expect(db.$executeRawUnsafe).toHaveBeenCalledTimes(2);
    expect(db.$executeRawUnsafe.mock.calls[1][6]).toBe(JSON.stringify({ teamId, vehicleId }));
  });
});
