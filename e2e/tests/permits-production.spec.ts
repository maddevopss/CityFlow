import { test, expect } from '@playwright/test';

const apiBase = process.env.CITYFLOW_API_URL || 'http://localhost:3000/api/v1';
const agentToken = process.env.CITYFLOW_E2E_AGENT_TOKEN || '';
const reviewerToken = process.env.CITYFLOW_E2E_PERMIT_REVIEWER_TOKEN || '';
const otherMunicipalityToken = process.env.CITYFLOW_E2E_OTHER_MUNICIPALITY_TOKEN || '';

test.describe('Permis — cycle de production', () => {
  test.skip(!agentToken || !reviewerToken || !otherMunicipalityToken, 'Jetons E2E requis');

  test('création → soumission → décision → délivrance → isolation', async ({ request }) => {
    const marker = Date.now();
    const created = await request.post(`${apiBase}/permit-applications`, {
      headers: { Authorization: `Bearer ${agentToken}` },
      data: { applicantName: `E2E ${marker}`, applicantEmail: `e2e-${marker}@example.test`, permitType: 'CONSTRUCTION', address: `${marker} rue Test`, description: 'Demande E2E complète' }
    });
    expect(created.status()).toBe(201);
    const application = await created.json();
    expect(application.status).toBe('DRAFT');

    const submitted = await request.post(`${apiBase}/permit-applications/${application.id}/submit`, { headers: { Authorization: `Bearer ${agentToken}` } });
    expect(submitted.status()).toBe(200);
    expect((await submitted.json()).status).toBe('SUBMITTED');

    const decided = await request.post(`${apiBase}/permit-applications/${application.id}/decision`, {
      headers: { Authorization: `Bearer ${reviewerToken}` },
      data: { decision: 'APPROVED', reason: 'Critères E2E satisfaits', conditions: ['Inspection finale requise'] }
    });
    expect(decided.status()).toBe(200);
    expect((await decided.json()).application.status).toBe('APPROVED');

    const issued = await request.post(`${apiBase}/permit-applications/${application.id}/issue`, { headers: { Authorization: `Bearer ${agentToken}` } });
    expect(issued.status()).toBe(200);
    expect((await issued.json()).status).toBe('ISSUED');

    const isolated = await request.get(`${apiBase}/permit-applications/${application.id}`, { headers: { Authorization: `Bearer ${otherMunicipalityToken}` } });
    expect(isolated.status()).toBe(404);
  });

  test('refuse une décision depuis un état interdit', async ({ request }) => {
    const marker = Date.now();
    const created = await request.post(`${apiBase}/permit-applications`, { headers: { Authorization: `Bearer ${agentToken}` }, data: { applicantName: `E2E interdit ${marker}`, applicantEmail: `blocked-${marker}@example.test`, permitType: 'CONSTRUCTION', address: `${marker} rue Interdite`, description: 'Transition négative' } });
    const application = await created.json();
    const decided = await request.post(`${apiBase}/permit-applications/${application.id}/decision`, { headers: { Authorization: `Bearer ${reviewerToken}` }, data: { decision: 'APPROVED', reason: 'Ne doit pas passer' } });
    expect(decided.status()).toBe(409);
  });
});
