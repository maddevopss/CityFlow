const { scoreCandidate, rankCandidates, assignBestCandidate } = require('../../src/services/fieldTeamPlanning');

describe('fieldTeamPlanning', () => {
  const task = { id: 't1', municipalityId: 7, requiredSkills: ['inspection'], sector: 'NORD', priority: 'NORMAL', scheduledAt: '2026-08-02T12:00:00Z' };

  test('classe les candidats admissibles', () => {
    const ranked = rankCandidates(task, [
      { id: 'b', municipalityId: 7, skills: ['inspection'], sectors: ['SUD'], activeAssignments: 1, distanceKm: 5 },
      { id: 'a', municipalityId: 7, skills: ['inspection'], sectors: ['NORD'], activeAssignments: 0, distanceKm: 3 }
    ]);
    expect(ranked[0].candidate.id).toBe('a');
  });

  test('exclut les candidats d’une autre municipalité ou sans compétence', () => {
    expect(scoreCandidate(task, { id: 'x', municipalityId: 8, skills: ['inspection'] })).toBe(Number.NEGATIVE_INFINITY);
    expect(scoreCandidate(task, { id: 'y', municipalityId: 7, skills: ['plomberie'] })).toBe(Number.NEGATIVE_INFINITY);
  });

  test('retourne la meilleure affectation', () => {
    expect(assignBestCandidate(task, [{ id: 'a', municipalityId: 7, skills: ['inspection'], sectors: ['NORD'] }])).toMatchObject({ taskId: 't1', assigneeId: 'a', considered: 1 });
  });

  test('refuse une affectation sans candidat admissible', () => {
    expect(() => assignBestCandidate(task, [])).toThrow('no eligible candidate');
  });
});
