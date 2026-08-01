const { ingestPermit } = require('../../src/services/permitIngestion');

const permit = {
  permit_id: 'PERMIT-001',
  contractor: 'Entrepreneur exemple',
  start_date: '2026-08-01T12:00:00.000Z',
  end_date: '2026-08-02T12:00:00.000Z',
  municipalityId: 1,
  geometry: { type: 'Point', coordinates: [-71.2, 46.8] },
  impacts: ['lane_closure']
};

describe('permitIngestion concurrence', () => {
  it('met à jour le brouillon créé par une requête concurrente', async () => {
    const prisma = {
      roadEvent: {
        findFirst: jest.fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ id: 'event-1', status: 'DRAFT' }),
        create: jest.fn().mockRejectedValue({ code: 'P2002' }),
        update: jest.fn().mockResolvedValue({ id: 'event-1', status: 'DRAFT' })
      }
    };

    const result = await ingestPermit(prisma, permit);

    expect(result).toEqual({
      event: { id: 'event-1', status: 'DRAFT' },
      operation: 'updated'
    });
    expect(prisma.roadEvent.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'event-1' }
    }));
  });

  it('refuse la collision lorsque le permis concurrent est déjà traité', async () => {
    const prisma = {
      roadEvent: {
        findFirst: jest.fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ id: 'event-2', status: 'SUBMITTED' }),
        create: jest.fn().mockRejectedValue({ code: 'P2002' }),
        update: jest.fn()
      }
    };

    await expect(ingestPermit(prisma, permit)).rejects.toMatchObject({
      code: 'PERMIT_ALREADY_PROCESSED',
      eventId: 'event-2'
    });
    expect(prisma.roadEvent.update).not.toHaveBeenCalled();
  });

  it('propage une erreur de création étrangère à l’unicité', async () => {
    const failure = new Error('database unavailable');
    const prisma = {
      roadEvent: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockRejectedValue(failure),
        update: jest.fn()
      }
    };

    await expect(ingestPermit(prisma, permit)).rejects.toBe(failure);
  });
});
