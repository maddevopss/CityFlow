import { test, expect } from '@playwright/test';

const apiBase = process.env.CITYFLOW_API_URL || 'http://localhost:3000/api/v1';
const executiveToken = process.env.CITYFLOW_E2E_EXECUTIVE_TOKEN || '';
const otherMunicipalityToken = process.env.CITYFLOW_E2E_OTHER_MUNICIPALITY_TOKEN || '';

test.describe('Tableau exécutif — production', () => {
  test.skip(!executiveToken || !otherMunicipalityToken, 'Jetons E2E requis');

  test('agrège les cinq modules avec période, fraîcheur et isolation', async ({ request }) => {
    const from = '2026-07-01T00:00:00.000Z';
    const to = '2026-08-01T00:00:00.000Z';
    const response = await request.get(`${apiBase}/executive-dashboard?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
      headers: { Authorization: `Bearer ${executiveToken}` }
    });
    expect(response.status()).toBe(200);
    const dashboard = await response.json();
    expect(dashboard.period).toEqual({ from, to });
    expect(dashboard.generatedAt).toBeTruthy();
    expect(Object.keys(dashboard.modules).sort()).toEqual(['assets', 'citizenReports', 'inspections', 'permits', 'publicWorks'].sort());

    for (const module of Object.values(dashboard.modules) as Array<Record<string, unknown>>) {
      expect(module).toBeTruthy();
    }

    const isolated = await request.get(`${apiBase}/executive-dashboard?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
      headers: { Authorization: `Bearer ${otherMunicipalityToken}` }
    });
    expect([200, 403]).toContain(isolated.status());
    if (isolated.status() === 200) {
      const other = await isolated.json();
      expect(other.municipalityId).not.toBe(dashboard.municipalityId);
    }
  });

  test('refuse une période inversée', async ({ request }) => {
    const response = await request.get(`${apiBase}/executive-dashboard?from=2026-08-10T00:00:00.000Z&to=2026-08-01T00:00:00.000Z`, {
      headers: { Authorization: `Bearer ${executiveToken}` }
    });
    expect(response.status()).toBe(400);
  });
});
