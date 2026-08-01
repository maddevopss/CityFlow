const {
  normalizeQuery,
  tokenize,
  scoreDocument,
  searchGlobal,
  sanitizeSearchResult
} = require('../../src/services/globalSearch');

describe('globalSearch', () => {
  test('normalise et découpe les requêtes', () => {
    expect(normalizeQuery('  Rue   Principale  ')).toBe('rue principale');
    expect(normalizeQuery(null)).toBe('');
    expect(tokenize('a rue de la principale')).toEqual(['rue', 'de', 'la', 'principale']);
    expect(tokenize(Array.from({ length: 12 }, (_, index) => `mot${index}`).join(' '))).toHaveLength(10);
  });

  test('calcule les scores par référence, titre et contenu', () => {
    const document = {
      reference: 'CF-42',
      title: 'Lampadaire brisé',
      body: 'Rue Principale'
    };
    expect(scoreDocument(document, ['cf-42'])).toBe(50);
    expect(scoreDocument(document, ['cf'])).toBe(20);
    expect(scoreDocument(document, ['lamp'])).toBe(15);
    expect(scoreDocument(document, ['brisé'])).toBe(10);
    expect(scoreDocument(document, ['principale'])).toBe(3);
    expect(scoreDocument({}, ['absent'])).toBe(0);
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

  test('applique les modules par défaut, le tri stable et les limites', () => {
    const documents = Array.from({ length: 105 }, (_, index) => ({
      id: String(index).padStart(3, '0'),
      municipalityId: 7,
      module: index % 2 ? 'REPORTS' : 'ASSETS',
      reference: `R-${index}`,
      title: 'Rue test',
      body: ''
    }));
    expect(searchGlobal({ municipalityId: 7, query: 'rue', documents, limit: 500 })).toHaveLength(100);
    expect(searchGlobal({ municipalityId: 7, query: 'rue', documents, limit: 0 })).toHaveLength(20);
    expect(searchGlobal({ municipalityId: 7, query: 'rue', documents, limit: -5 })).toHaveLength(1);
    expect(searchGlobal({ municipalityId: 7, query: 'x', documents: null })).toEqual([]);
  });

  test('refuse les entrées invalides et les requêtes vides', () => {
    expect(() => searchGlobal({ municipalityId: '7', query: 'test', documents: [] })).toThrow('municipalityId required');
    expect(searchGlobal({ municipalityId: 7, query: 'a', documents: [] })).toEqual([]);
    expect(() => searchGlobal({ municipalityId: 7, query: 'test', modules: ['SECRET'], documents: [] })).toThrow('invalid module');
  });

  test('retire les métadonnées internes', () => {
    expect(sanitizeSearchResult({ id: 'x', municipalityId: 7, privateNotes: 'secret', internalMetadata: {}, title: 'ok' })).toEqual({ id: 'x', title: 'ok' });
  });
});
