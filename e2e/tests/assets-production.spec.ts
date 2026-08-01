import { test, expect } from '@playwright/test';
const apiBase = process.env.CITYFLOW_API_URL || 'http://localhost:3000/api/v1';
const managerToken = process.env.CITYFLOW_E2E_ASSET_MANAGER_TOKEN || '';
const otherMunicipalityToken = process.env.CITYFLOW_E2E_OTHER_MUNICIPALITY_TOKEN || '';

test.describe('Actifs municipaux — cycle de production', () => {
  test.skip(!managerToken || !otherMunicipalityToken, 'Jetons E2E requis');
  test('création → évaluation → hors service → isolation', async ({ request }) => {
    const marker = Date.now();
    const created = await request.post(`${apiBase}/assets`, { headers: { Authorization: `Bearer ${managerToken}` }, data: { publicCode: `BLD-${marker}`, name: `Bâtiment E2E ${marker}`, category: 'BUILDING', status: 'ACTIVE', criticality: 'HIGH', address: `${marker} rue Test` } });
    expect(created.status()).toBe(201);
    const asset = await created.json();

    const assessed = await request.post(`${apiBase}/assets/${asset.id}/assessments`, { headers: { Authorization: `Bearer ${managerToken}` }, data: { condition: 'POOR', score: 35, notes: 'Évaluation E2E' } });
    expect(assessed.status()).toBe(201);

    const changed = await request.post(`${apiBase}/assets/${asset.id}/status`, { headers: { Authorization: `Bearer ${managerToken}` }, data: { status: 'OUT_OF_SERVICE', reason: 'Condition insuffisante' } });
    expect(changed.status()).toBe(200);
    expect((await changed.json()).status).toBe('OUT_OF_SERVICE');

    const isolated = await request.get(`${apiBase}/assets/${asset.id}`, { headers: { Authorization: `Bearer ${otherMunicipalityToken}` } });
    expect(isolated.status()).toBe(404);
  });
});
