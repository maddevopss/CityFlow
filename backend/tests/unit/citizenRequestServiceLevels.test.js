const {
  targetHoursForCategory,
  evaluateCitizenRequestServiceLevel,
  summarizeCitizenRequestServiceLevels
} = require('../../src/services/citizenRequestServiceLevels');

describe('citizenRequestServiceLevels', () => {
  const now = new Date('2026-08-01T12:00:00.000Z');

  test('applique une cible selon la catégorie', () => {
    expect(targetHoursForCategory('SAFETY')).toBe(4);
    expect(targetHoursForCategory('lighting')).toBe(72);
    expect(targetHoursForCategory('UNKNOWN')).toBe(168);
  });

  test('détecte une demande en dépassement', () => {
    const result = evaluateCitizenRequestServiceLevel({
      id: 'r1',
      category: 'WATER',
      status: 'IN_PROGRESS',
      createdAt: '2026-07-30T12:00:00.000Z'
    }, now);

    expect(result.serviceLevel).toMatchObject({
      level: 'BREACHED',
      targetHours: 24,
      hoursRemaining: -24
    });
  });

  test('distingue les demandes à risque et terminées', () => {
    const result = summarizeCitizenRequestServiceLevels([
      { id: 'risk', category: 'LIGHTING', status: 'IN_REVIEW', createdAt: '2026-07-30T18:00:00.000Z' },
      { id: 'done', category: 'ROAD', status: 'RESOLVED', createdAt: '2026-07-20T00:00:00.000Z' }
    ], now);

    expect(result.summary).toEqual({ ON_TRACK: 0, AT_RISK: 1, BREACHED: 0, COMPLETED: 1 });
    expect(result.items.map((item) => item.serviceLevel.level)).toEqual(['AT_RISK', 'COMPLETED']);
  });
});
