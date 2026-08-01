'use strict';

const ALLOWED_LAYERS = new Set(['REPORTS', 'PERMITS', 'INSPECTIONS', 'WORKS', 'ASSETS']);

function toFeature(item, layer) {
  if (!item?.geometry) return null;
  return {
    type: 'Feature',
    id: `${layer}:${item.id}`,
    geometry: item.geometry,
    properties: {
      layer,
      id: item.id,
      status: item.status || 'UNKNOWN',
      title: item.title || item.name || item.address || item.reference || item.id,
      municipalityId: item.municipalityId,
      updatedAt: item.updatedAt || null
    }
  };
}

function buildOperationalMap({ municipalityId, layers, records, bounds }) {
  if (!Number.isInteger(municipalityId)) throw new Error('municipalityId required');
  const selected = (layers || []).map((layer) => String(layer).toUpperCase());
  if (!selected.length || selected.some((layer) => !ALLOWED_LAYERS.has(layer))) throw new Error('invalid layers');
  const features = [];
  for (const layer of selected) {
    for (const item of records?.[layer] || []) {
      if (item.municipalityId !== municipalityId) continue;
      const feature = toFeature(item, layer);
      if (feature) features.push(feature);
    }
  }
  return {
    type: 'FeatureCollection',
    bbox: bounds || null,
    metadata: { municipalityId, layers: selected, count: features.length },
    features
  };
}

function summarizeLayers(collection) {
  return collection.features.reduce((summary, feature) => {
    summary[feature.properties.layer] = (summary[feature.properties.layer] || 0) + 1;
    return summary;
  }, {});
}

module.exports = { ALLOWED_LAYERS, buildOperationalMap, summarizeLayers };
