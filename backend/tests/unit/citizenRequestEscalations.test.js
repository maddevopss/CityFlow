const { escalateCitizenRequestServiceLevels } = require('../../src/services/citizenRequestEscalations');

describe('citizenRequestEscalations', () => {
  const now = new Date('2026-08-01T12:00:00.000Z');

  test('crée des alertes à risque et dépassées sans doublon', async () => {
    const db = {
      citizenRequest: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'risk', title: 'Lampadaire', category: 'LIGHTING', status: 'IN_REVIEW', createdAt: '2026-07-29T12:00:00.000Z' },
          { id: 'late', title: 'Fuite', category: 'WATER', status: 'IN_PROGRESS', createdAt: '2026-07-30T00:00:00.000Z' }
        ])
      },
      user: {
        findMany: jest.fn().mockResolvedValue([{ id: 'manager-1' }, { id: 'admin-1' }])
      },
      notification: {
        findMany: jest.fn().mockResolvedValue([
          { requestId: 'risk', eventType: 'CITIZEN_REQUEST_AT_RISK', recipientId: 'manager-1' }
        ]),
        createMany: jest.fn().mockResolvedValue({ count: 3 })
      }
    };

    const result = await escalateCitizenRequestServiceLevels(db, 7, now);

    expect(result).toEqual({ scanned: 2, candidates: 2, created: 3 });
    expect(db.notification.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ requestId: 'risk', recipientId: 'admin-1', eventType: 'CITIZEN_REQUEST_AT_RISK' }),
        expect.objectContaining({ requestId: 'late', recipientId: 'manager-1', eventType: 'CITIZEN_REQUEST_BREACHED' }),
        expect.objectContaining({ requestId: 'late', recipientId: 'admin-1', eventType: 'CITIZEN_REQUEST_BREACHED' })
      ])
    });
  });

  test('ne crée rien sans candidat', async () => {
    const db = {
      citizenRequest: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'ok', title: 'Route', category: 'ROAD', status: 'SUBMITTED', createdAt: '2026-08-01T10:00:00.000Z' }
        ])
      },
      user: { findMany: jest.fn() },
      notification: { findMany: jest.fn(), createMany: jest.fn() }
    };

    await expect(escalateCitizenRequestServiceLevels(db, 7, now))
      .resolves.toEqual({ scanned: 1, candidates: 0, created: 0 });
    expect(db.user.findMany).not.toHaveBeenCalled();
    expect(db.notification.createMany).not.toHaveBeenCalled();
  });
});
