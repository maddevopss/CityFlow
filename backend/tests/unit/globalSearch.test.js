const { normalizeQuery, searchGlobal, sanitizeSearchResult } = require('../../src/services/globalSearch');

describe('globalSearch', () => {
  test('normalise la requête en français canadien', () => {
    expect(normalizeQuery('  Rue   Principale  ')).toBe('rue principale');
  });

  test('classe les résultats et isole la municipalité', () => {
    const results = searchGlobal({
      municipalityId: 7,
      query: 'CF-42 lampadaire',
      modules: ['reports', 'assets'],
      documents: [
        { id: 'r1', municipalityId: 7, module: 'REPORTS', reference: 'CF-42', title: 'Lampadaire brisé', body: 'Rue Principale' },
        { id: 'a1', municipalityId: 7, module: 'ASSETS', reference: 'A-9', title: 'Lampadaire nord', body: 'Inspection requise' },
        { id: 'r2', municipalityId: 8, module: 'REPORTS', reference: 'CF-42', title: 'Lampadaire externe', body: '' }
      ]
    });
    expect(results.map((result) => result.id)).toEqual(['r1', 'a1']);
  });

  test('refuse un module inconnu', () => {
    expect(() => searchGlobal({ municipalityId: 7, query: 'test', modules: ['SECRET'], documents: [] })).toThrow('invalid module');
  });

  test('retire les métadonnées internes', () => {
    expect(sanitizeSearchResult({ id: 'x', municipalityId: 7, privateNotes: 'secret', internalMetadata: {}, title: 'ok' })).toEqual({ id: 'x', title: 'ok' });
  });
});
