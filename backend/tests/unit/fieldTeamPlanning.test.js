const { scoreCandidate, rankCandidates, assignBestCandidate } = require('../../src/services/fieldTeamPlanning');

describe('fieldTeamPlanning', () => {
  const task = {
    id: 't1',
    municipalityId: 7,
    requiredSkills: ['inspection'],
    sector: 'NORD',
    priority: 'NORMAL',
    scheduledAt: '2026-08-02T12:00:00Z'
  };

  test('classe les candidats admissibles', () => {
    const ranked = rankCandidates(task, [
      { id: 'b', municipalityId: 7, skills: ['inspection'], sectors: ['SUD'], activeAssignments: 1, distanceKm: 5 },
      { id: 'a', municipalityId: 7, skills: ['inspection'], sectors: ['NORD'], activeAssignments: 0, distanceKm: 3 }
    ]);
    expect(ranked[0].candidate.id).toBe('a');
  });

  test('exclut un contexte absent, un agent inactif ou une autre municipalité', () => {
    expect(scoreCandidate(null, {})).toBe(Number.NEGATIVE_INFINITY);
    expect(scoreCandidate(task, null)).toBe(Number.NEGATIVE_INFINITY);
    expect(scoreCandidate(task, { municipalityId: 7, isActive: false, skills: ['inspection'] })).toBe(Number.NEGATIVE_INFINITY);
    expect(scoreCandidate(task, { id: 'x', municipalityId: 8, skills: ['inspection'] })).toBe(Number.NEGATIVE_INFINITY);
  });

  test('exclut un candidat qui ne possède pas toutes les compétences', () => {
    expect(scoreCandidate(task, { id: 'y', municipalityId: 7, skills: ['plomberie'] })).toBe(Number.NEGATIVE_INFINITY);
    expect(scoreCandidate({ ...task, requiredSkills: undefined }, { id: 'z', municipalityId: 7, skills: undefined })).toBe(100);
  });

  test('applique les pondérations de charge, secteur et distance', () => {
    const candidate = {
      id: 'a',
      municipalityId: 7,
      skills: [' inspection ', ''],
      sectors: ['NORD'],
      activeAssignments: 2,
      distanceKm: 70
    };
    expect(scoreCandidate(task, candidate)).toBe(50);
    expect(scoreCandidate(task, { ...candidate, activeAssignments: -2, distanceKm: Number.NaN })).toBe(120);
  });

  test('priorise les urgences critiques selon la charge critique', () => {
    const criticalTask = { ...task, priority: 'CRITICAL', sector: undefined };
    expect(scoreCandidate(criticalTask, {
      municipalityId: 7,
      skills: ['inspection'],
      criticalAssignments: 0
    })).toBe(120);
    expect(scoreCandidate(criticalTask, {
      municipalityId: 7,
      skills: ['inspection'],
      criticalAssignments: 3
    })).toBe(100);
  });

  test('pénalise un agent disponible après l’heure planifiée', () => {
    const baseCandidate = { municipalityId: 7, skills: ['inspection'] };
    expect(scoreCandidate(task, {
      ...baseCandidate,
      availableFrom: '2026-08-02T13:00:00Z'
    })).toBe(60);
    expect(scoreCandidate(task, {
      ...baseCandidate,
      availableFrom: '2026-08-02T11:00:00Z'
    })).toBe(100);
    expect(scoreCandidate({ ...task, scheduledAt: undefined }, {
      ...baseCandidate,
      availableFrom: '2026-08-02T13:00:00Z'
    })).toBe(100);
  });

  test('stabilise les égalités avec l’identifiant', () => {
    const ranked = rankCandidates(task, [
      { id: 'b', municipalityId: 7, skills: ['inspection'] },
      { id: 'a', municipalityId: 7, skills: ['inspection'] }
    ]);
    expect(ranked.map(({ candidate }) => candidate.id)).toEqual(['a', 'b']);
    expect(rankCandidates(task, undefined)).toEqual([]);
  });

  test('retourne la meilleure affectation', () => {
    expect(assignBestCandidate(task, [
      { id: 'a', municipalityId: 7, skills: ['inspection'], sectors: ['NORD'] }
    ])).toMatchObject({ taskId: 't1', assigneeId: 'a', considered: 1 });
  });

  test('refuse une affectation sans candidat admissible', () => {
    expect(() => assignBestCandidate(task, [])).toThrow('no eligible candidate');
    try {
      assignBestCandidate(task, []);
    } catch (error) {
      expect(error.status).toBe(409);
    }
  });
});
