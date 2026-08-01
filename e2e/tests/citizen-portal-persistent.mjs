import assert from 'node:assert/strict';

const baseUrl = process.env.CITYFLOW_API_URL;
const citizenToken = process.env.CITYFLOW_E2E_CITIZEN_TOKEN;
const agentToken = process.env.CITYFLOW_E2E_AGENT_TOKEN;
if (!baseUrl || !citizenToken || !agentToken) throw new Error('Variables E2E citoyennes manquantes');
if (/localhost|127\.0\.0\.1|production|prod\./i.test(baseUrl)) throw new Error('La cible E2E doit être une préproduction distante');

async function request(path, token, options = {}) {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/v1${path}`, {
    ...options,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...(options.headers || {}) }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${path}: ${response.status} ${JSON.stringify(body)}`);
  return body;
}

const created = await request('/citizen/requests', citizenToken, {
  method: 'POST',
  body: JSON.stringify({ title: 'Lampadaire défectueux E2E', description: 'Le lampadaire ne fonctionne plus depuis deux soirs.', category: 'ROAD' })
});
assert.match(created.id, /^[0-9a-f-]{36}$/i);

const list = await request('/citizen/requests?page=1&pageSize=20', citizenToken);
assert.ok(list.items.some(item => item.id === created.id));

const assigned = await request(`/citizen/requests/${created.id}/assign`, agentToken, {
  method: 'POST', body: JSON.stringify({ team: 'Voirie de soir' })
});
assert.equal(assigned.status, 'IN_REVIEW');

const citizenMessage = await request(`/citizen/requests/${created.id}/messages`, citizenToken, {
  method: 'POST', body: JSON.stringify({ body: 'Le problème est toujours présent.' })
});
assert.equal(citizenMessage.body, 'Le problème est toujours présent.');

await request(`/citizen/requests/${created.id}/messages`, agentToken, {
  method: 'POST', body: JSON.stringify({ body: 'Une équipe est affectée au dossier.' })
});

const resolved = await request(`/citizen/requests/${created.id}/status`, agentToken, {
  method: 'POST', body: JSON.stringify({ status: 'RESOLVED', resolution: 'Ampoule remplacée et circuit vérifié.' })
});
assert.equal(resolved.status, 'RESOLVED');

const timeline = await request(`/citizen/requests/${created.id}`, citizenToken);
assert.equal(timeline.request.id, created.id);
assert.ok(timeline.events.some(event => event.type === 'STATUS_CHANGED'));
assert.ok(timeline.messages.length >= 2);

const notifications = await request('/notifications?page=1&pageSize=100', citizenToken);
assert.ok(notifications.items.some(item => item.resourceId === created.id));

console.log(JSON.stringify({ requestId: created.id, status: resolved.status, messages: timeline.messages.length, notifications: notifications.items.length }));
