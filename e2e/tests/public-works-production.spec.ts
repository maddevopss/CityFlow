import { test, expect } from '@playwright/test';

const apiBase = process.env.CITYFLOW_STAGING_API_URL || '';
const managerToken = process.env.CITYFLOW_E2E_PUBLIC_WORKS_MANAGER_TOKEN || '';
const workerToken = process.env.CITYFLOW_E2E_FIELD_WORKER_TOKEN || '';
const otherMunicipalityToken = process.env.CITYFLOW_E2E_OTHER_MUNICIPALITY_TOKEN || '';

test.describe('Travaux publics — cycle de production', () => {
  test('création → affectation → démarrage → journal → fin → isolation', async ({ request }) => {
    expect(apiBase).not.toBe('');
    expect(managerToken).not.toBe('');
    expect(workerToken).not.toBe('');
    expect(otherMunicipalityToken).not.toBe('');

    const marker = Date.now();
    const created = await request.post(`${apiBase}/work-orders`, {
      headers: { Authorization: `Bearer ${managerToken}` },
      data: { title: `Réparation E2E ${marker}`, description: 'Intervention complète de validation', workType: 'CORRECTIVE', priority: 'HIGH' }
    });
    expect(created.status()).toBe(201);
    const workOrder = await created.json();

    const assigned = await request.post(`${apiBase}/work-orders/${workOrder.id}/assign`, {
      headers: { Authorization: `Bearer ${managerToken}` },
      data: { assignedTeamId: '33333333-3333-4333-8333-333333333333', scheduledStart: new Date(Date.now() + 3600000).toISOString(), scheduledEnd: new Date(Date.now() + 7200000).toISOString() }
    });
    expect(assigned.status()).toBe(200);

    const started = await request.post(`${apiBase}/work-orders/${workOrder.id}/start`, { headers: { Authorization: `Bearer ${workerToken}` } });
    expect(started.status()).toBe(200);

    const logged = await request.post(`${apiBase}/work-orders/${workOrder.id}/logs`, {
      headers: { Authorization: `Bearer ${workerToken}` },
      data: { logType: 'TIME', description: 'Intervention terrain E2E', hours: 1.5 }
    });
    expect(logged.status()).toBe(201);

    const completed = await request.post(`${apiBase}/work-orders/${workOrder.id}/complete`, {
      headers: { Authorization: `Bearer ${workerToken}` },
      data: { actualCost: 275.5, summary: 'Intervention terminée avec preuve de journal' }
    });
    expect(completed.status()).toBe(200);
    expect((await completed.json()).status).toBe('COMPLETED');

    const isolated = await request.get(`${apiBase}/work-orders/${workOrder.id}`, { headers: { Authorization: `Bearer ${otherMunicipalityToken}` } });
    expect(isolated.status()).toBe(404);
  });
});
