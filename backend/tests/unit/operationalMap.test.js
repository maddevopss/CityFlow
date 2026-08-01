const { buildOperationalMap, summarizeLayers } = require('../../src/services/operationalMap');

describe('operationalMap', () => {
  test('agrège les couches autorisées et isole la municipalité', () => {
    const collection = buildOperationalMap({
      municipalityId: 7,
      layers: ['reports', 'assets'],
      records: {
        REPORTS: [{ id: 'r1', municipalityId: 7, geometry: { type: 'Point', coordinates: [-73, 45] }, status: 'OPEN' }],
        ASSETS: [
          { id: 'a1', municipalityId: 7, geometry: { type: 'Point', coordinates: [-73.1, 45.1] }, status: 'ACTIVE' },
          { id: 'a2', municipalityId: 8, geometry: { type: 'Point', coordinates: [-72, 46] } }
        ]
      }
    });
    expect(collection.features).toHaveLength(2);
    expect(summarizeLayers(collection)).toEqual({ REPORTS: 1, ASSETS: 1 });
  });

  test('ignore les objets sans géométrie', () => {
    const collection = buildOperationalMap({ municipalityId: 7, layers: ['WORKS'], records: { WORKS: [{ id: 'w1', municipalityId: 7 }] } });
    expect(collection.features).toHaveLength(0);
  });

  test('refuse les couches inconnues', () => {
    expect(() => buildOperationalMap({ municipalityId: 7, layers: ['SECRET'], records: {} })).toThrow('invalid layers');
  });
});
