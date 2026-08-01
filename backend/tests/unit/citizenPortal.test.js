const {
  normalizeCitizenRequest,
  assertCitizenOwnership,
  transitionCitizenRequest,
  citizenTimeline
} = require('../../src/services/citizenPortal');

describe('citizenPortal', () => {
  const actor = { id: '11111111-1111-4111-8111-111111111111', municipalityId: 7 };

  test('normalise une demande citoyenne valide', () => {
    expect(normalizeCitizenRequest({
      title: 'Lampadaire brisé',
      description: 'Le lampadaire clignote depuis trois jours.',
      category: 'lighting'
    }, actor)).toMatchObject({ municipalityId: 7, citizenId: actor.id, status: 'SUBMITTED', category: 'LIGHTING' });
  });

  test('refuse une demande trop courte', () => {
    expect(() => normalizeCitizenRequest({ title: 'X', description: 'trop court' }, actor)).toThrow('invalid title');
  });

  test('isole les citoyens et municipalités', () => {
    expect(() => assertCitizenOwnership({ citizenId: actor.id, municipalityId: 8 }, actor)).toThrow('request not found');
  });

  test('applique uniquement les transitions permises', () => {
    expect(transitionCitizenRequest({ status: 'SUBMITTED' }, 'ACKNOWLEDGED', actor).status).toBe('ACKNOWLEDGED');
    expect(() => transitionCitizenRequest({ status: 'SUBMITTED' }, 'CLOSED', actor)).toThrow('invalid transition');
  });

  test('ordonne la chronologie', () => {
    const result = citizenTimeline({ id: 'r1', title: 'Test', status: 'IN_REVIEW', updatedAt: '2026-08-01T00:00:00Z', events: [
      { createdAt: '2026-08-02T00:00:00Z', type: 'STATUS' }
    ] }, [{ createdAt: '2026-08-01T12:00:00Z', type: 'MESSAGE' }]);
    expect(result.events.map((event) => event.type)).toEqual(['MESSAGE', 'STATUS']);
  });
});
