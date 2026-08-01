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

  test('normalise les pièces jointes et les valeurs par défaut', () => {
    const result = normalizeCitizenRequest({
      title: 'Arbre dangereux',
      description: 'Une branche menace de tomber sur le trottoir.',
      attachments: [{ fileName: 'photo.jpg', mimeType: 'image/jpeg', sizeBytes: '42', storageKey: 'citizen/7/photo.jpg' }]
    }, actor);
    expect(result.category).toBe('OTHER');
    expect(result.location).toBeNull();
    expect(result.attachments).toEqual([{ fileName: 'photo.jpg', mimeType: 'image/jpeg', sizeBytes: 42, storageKey: 'citizen/7/photo.jpg' }]);
  });

  test('refuse un contexte citoyen incomplet', () => {
    expect(() => normalizeCitizenRequest({ title: 'Titre valide', description: 'Description suffisamment longue.' }, {})).toThrow('citizen context required');
  });

  test('refuse les titres et descriptions invalides', () => {
    expect(() => normalizeCitizenRequest({ title: 'X', description: 'Description suffisamment longue.' }, actor)).toThrow('invalid title');
    expect(() => normalizeCitizenRequest({ title: 'Titre valide', description: 'court' }, actor)).toThrow('invalid description');
  });

  test('refuse plus de dix pièces jointes', () => {
    expect(() => normalizeCitizenRequest({
      title: 'Dépôt avec trop de fichiers',
      description: 'Cette demande contient volontairement trop de pièces jointes.',
      attachments: Array.from({ length: 11 }, (_, index) => ({ fileName: `${index}.jpg` }))
    }, actor)).toThrow('too many attachments');
  });

  test('valide et isole la propriété citoyenne', () => {
    expect(() => assertCitizenOwnership({ citizenId: actor.id, municipalityId: 7 }, actor)).not.toThrow();
    expect(() => assertCitizenOwnership({ citizenId: actor.id, municipalityId: 8 }, actor)).toThrow('request not found');
    expect(() => assertCitizenOwnership(null, actor)).toThrow('request not found');
  });

  test('applique uniquement les transitions permises', () => {
    expect(transitionCitizenRequest({ status: 'SUBMITTED' }, 'ACKNOWLEDGED', actor)).toMatchObject({ status: 'ACKNOWLEDGED', statusChangedBy: actor.id });
    expect(() => transitionCitizenRequest({ status: 'SUBMITTED' }, 'CLOSED', actor)).toThrow('invalid transition');
    expect(() => transitionCitizenRequest({ status: 'SUBMITTED' }, 'DELETED', actor)).toThrow('invalid status');
  });

  test('accepte un changement sans acteur système explicite', () => {
    expect(transitionCitizenRequest({ status: 'ACKNOWLEDGED' }, 'IN_REVIEW')).toMatchObject({ status: 'IN_REVIEW', statusChangedBy: null });
  });

  test('ordonne la chronologie et ignore les entrées invalides', () => {
    const result = citizenTimeline({ id: 'r1', title: 'Test', status: 'IN_REVIEW', updatedAt: '2026-08-01T00:00:00Z', events: [
      null,
      { createdAt: '2026-08-02T00:00:00Z', type: 'STATUS' },
      { type: 'INVALID' }
    ] }, [{ createdAt: '2026-08-01T12:00:00Z', type: 'MESSAGE' }]);
    expect(result.events.map((event) => event.type)).toEqual(['MESSAGE', 'STATUS']);
  });

  test('supporte une chronologie sans événements ni messages', () => {
    expect(citizenTimeline({ id: 'r2', title: 'Vide', status: 'SUBMITTED' }).events).toEqual([]);
  });
});
