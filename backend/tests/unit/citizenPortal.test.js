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

  test('ordonne séparément les événements et les messages', () => {
    const result = citizenTimeline({
      id: 'r1',
      title: 'Test',
      status: 'IN_REVIEW',
      updatedAt: '2026-08-01T00:00:00Z',
      events: [
        { id: 'e2', createdAt: '2026-08-02T00:00:00Z', eventType: 'STATUS', toStatus: 'IN_REVIEW' },
        { id: 'e1', createdAt: '2026-08-01T10:00:00Z', eventType: 'CREATED', toStatus: 'SUBMITTED' }
      ]
    }, [
      { id: 'm2', createdAt: '2026-08-01T12:00:00Z', authorId: 'u2', body: 'Deuxième' },
      { id: 'm1', createdAt: '2026-08-01T11:00:00Z', authorId: 'u1', body: 'Premier' }
    ]);

    expect(result.request).toMatchObject({ id: 'r1', title: 'Test', status: 'IN_REVIEW' });
    expect(result.events.map((event) => event.type)).toEqual(['CREATED', 'STATUS']);
    expect(result.messages.map((message) => message.body)).toEqual(['Premier', 'Deuxième']);
    expect(result.messages.map((message) => message.senderId)).toEqual(['u1', 'u2']);
  });
});
