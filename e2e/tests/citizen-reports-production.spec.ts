import { test, expect } from '@playwright/test';

const apiBase = process.env.CITYFLOW_API_URL || 'http://localhost:3000/api/v1';
const managerToken = process.env.CITYFLOW_E2E_CITIZEN_REPORTS_MANAGER_TOKEN || '';
const otherMunicipalityToken = process.env.CITYFLOW_E2E_OTHER_MUNICIPALITY_TOKEN || '';

test.describe('Signalements citoyens — cycle de production', () => {
  test.skip(!managerToken || !otherMunicipalityToken, 'Jetons E2E requis');

  test('création publique → suivi → triage → résolution → isolation', async ({ request }) => {
    const marker = Date.now();
    const created = await request.post(`${apiBase}/citizen-reports/public`, {
      data: {
        municipalityId: 1,
        category: 'ROAD',
        title: `Nid-de-poule E2E ${marker}`,
        description: 'Signalement de validation de préproduction',
        address: `${marker} rue Test`,
        reporterEmail: `citizen-${marker}@example.test`,
        consentToContact: true
      }
    });
    expect(created.status()).toBe(201);
    const publicReport = await created.json();
    expect(publicReport.publicNumber).toBeTruthy();
    expect(publicReport.trackingToken).toBeTruthy();

    const tracked = await request.get(`${apiBase}/citizen-reports/public/${publicReport.publicNumber}`, {
      headers: { 'x-cityflow-tracking-token': publicReport.trackingToken }
    });
    expect(tracked.status()).toBe(200);

    const queue = await request.get(`${apiBase}/citizen-reports?q=${marker}`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    expect(queue.status()).toBe(200);
    const page = await queue.json();
    const report = page.items.find((item: { publicNumber: string }) => item.publicNumber === publicReport.publicNumber);
    expect(report).toBeTruthy();

    const triaged = await request.post(`${apiBase}/citizen-reports/${report.id}/transition`, {
      headers: { Authorization: `Bearer ${managerToken}` },
      data: { status: 'TRIAGED', priority: 'HIGH', reason: 'Triage E2E' }
    });
    expect(triaged.status()).toBe(200);

    const resolved = await request.post(`${apiBase}/citizen-reports/${report.id}/transition`, {
      headers: { Authorization: `Bearer ${managerToken}` },
      data: { status: 'RESOLVED', reason: 'Correction effectuée' }
    });
    expect(resolved.status()).toBe(200);

    const isolated = await request.get(`${apiBase}/citizen-reports/${report.id}`, {
      headers: { Authorization: `Bearer ${otherMunicipalityToken}` }
    });
    expect(isolated.status()).toBe(404);
  });
});
