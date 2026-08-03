jest.mock('../../src/db/prisma', () => ({ $executeRaw: jest.fn() }));

const prisma = require('../../src/db/prisma');
const { appendSecurityAudit } = require('../../src/services/securityAudit');

describe('securityAudit', () => {
  beforeEach(() => jest.clearAllMocks());

  it('enregistre un événement sans données sensibles', async () => {
    prisma.$executeRaw.mockResolvedValue(1);

    const id = await appendSecurityAudit({
      action: 'auth.login.succeeded',
      result: 'SUCCESS',
      municipalityId: 7,
      actorId: '11111111-1111-4111-8111-111111111111',
      requestId: 'request-1'
    });

    expect(id).toEqual(expect.any(String));
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
  });

  it('refuse une action non cataloguée', async () => {
    await expect(appendSecurityAudit({
      action: 'auth.login.succeeded.password',
      result: 'SUCCESS'
    })).rejects.toThrow('Action d’audit de sécurité non autorisée');
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });
});
