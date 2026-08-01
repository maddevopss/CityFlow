jest.mock('../../src/services/eventAudit', () => ({ appendEventAudit: jest.fn() }));

const { appendEventAudit } = require('../../src/services/eventAudit');
const { transitionPermit, buildTransitionData } = require('../../src/services/permitDecision');

function createDb(status = 'DRAFT') {
  const tx = {
    roadEvent: {
      findFirst: jest.fn().mockResolvedValue({
        id: 'permit-1',
        municipalityId: 7,
        sourceType: 'PERMIT',
        subtype: 'CONSTRUCTION',
        status,
        details: {}
      }),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'permit-1', municipalityId: 7, ...data }))
    },
    permitDocumentRequirement: {
      findUnique: jest.fn().mockResolvedValue(null)
    }
  };
  return { db: { $transaction: jest.fn((callback) => callback(tx)) }, tx };
}

beforeEach(() => jest.clearAllMocks());

test.each([
  ['submit', 'DRAFT', 'SUBMITTED'],
  ['submit', 'REJECTED', 'SUBMITTED'],
  ['approve', 'SUBMITTED', 'APPROVED'],
  ['reject', 'SUBMITTED', 'REJECTED'],
  ['close', 'APPROVED', 'CLOSED'],
  ['close', 'ACTIVE', 'CLOSED']
])('applique la transition %s depuis %s', async (action, from, to) => {
  const { db, tx } = createDb(from);
  const result = await transitionPermit(db, {
    permitId: 'permit-1', municipalityId: 7, action,
    actorId: 'user-1', actorRole: 'MANAGER',
    reason: ['reject', 'close'].includes(action) ? 'Motif valide' : null,
    now: new Date('2026-08-01T12:00:00Z')
  });
  expect(result.status).toBe(to);
  expect(tx.roadEvent.findFirst).toHaveBeenCalledWith({ where: { id: 'permit-1', municipalityId: 7, sourceType: 'PERMIT' } });
  expect(appendEventAudit).toHaveBeenCalledWith(expect.objectContaining({ previousStatus: from, newStatus: to, municipalityId: 7 }));
});

test('refuse une transition incompatible', async () => {
  const { db } = createDb('DRAFT');
  await expect(transitionPermit(db, {
    permitId: 'permit-1', municipalityId: 7, action: 'approve', actorId: 'user-1', actorRole: 'MANAGER'
  })).rejects.toMatchObject({ code: 'PERMIT_TRANSITION_CONFLICT', currentStatus: 'DRAFT', allowedFrom: ['SUBMITTED'] });
});

test('exige un motif pour le refus et la fermeture', async () => {
  const { db } = createDb('SUBMITTED');
  await expect(transitionPermit(db, {
    permitId: 'permit-1', municipalityId: 7, action: 'reject', actorId: 'user-1', actorRole: 'MANAGER', reason: 'x'
  })).rejects.toMatchObject({ code: 'PERMIT_REASON_REQUIRED' });
});

test('masque un permis hors municipalité', async () => {
  const { db, tx } = createDb('DRAFT');
  tx.roadEvent.findFirst.mockResolvedValue(null);
  await expect(transitionPermit(db, {
    permitId: 'permit-1', municipalityId: 99, action: 'submit', actorId: 'user-1', actorRole: 'MUNICIPAL_AGENT'
  })).rejects.toMatchObject({ code: 'PERMIT_NOT_FOUND' });
});

test('prépare les horodatages métier', () => {
  const now = new Date('2026-08-01T12:00:00Z');
  expect(buildTransitionData('submit', 'u1', null, now)).toMatchObject({ submittedBy: 'u1', submittedAt: now, statusReason: null });
  expect(buildTransitionData('approve', 'u2', null, now)).toMatchObject({ approvedBy: 'u2', approvedAt: now });
  expect(buildTransitionData('close', 'u3', 'Terminé', now)).toMatchObject({ closedBy: 'u3', closedAt: now, statusReason: 'Terminé' });
});
