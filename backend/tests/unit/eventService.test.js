const eventService = require('../../src/services/eventService');

// Mock Prisma
jest.mock('../../src/db/prisma', () => ({
  roadEvent: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

const prisma = require('../../src/db/prisma');

describe('EventService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('devrait créer un événement avec succès', async () => {
      const mockEvent = {
        id: '123',
        eventType: 'CONSTRUCTION',
        subtype: 'road_work',
        municipalityId: 1,
        status: 'PLANNED'
      };

      prisma.roadEvent.create.mockResolvedValue(mockEvent);

      const data = {
        eventType: 'CONSTRUCTION',
        subtype: 'road_work',
        geometry: { type: 'Point', coordinates: [-71.2, 46.8] },
        startTime: new Date(),
        impacts: ['lane_closure']
      };

      const user = { sub: 'user-1', municipalityId: 1 };

      const result = await eventService.create(data, user);
      
      expect(result).toEqual(mockEvent);
      expect(prisma.roadEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: 'CONSTRUCTION',
            municipalityId: 1
          })
        })
      );
    });
  });

  describe('findAll', () => {
    it('devrait retourner les événements filtrés', async () => {
      const mockEvents = [
        { id: '1', eventType: 'CONSTRUCTION' },
        { id: '2', eventType: 'REGULATION' }
      ];

      prisma.roadEvent.findMany.mockResolvedValue(mockEvents);

      const result = await eventService.findAll({ status: 'ACTIVE' });
      
      expect(result).toHaveLength(2);
      expect(prisma.roadEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'ACTIVE' })
        })
      );
    });
  });
});
