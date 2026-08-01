import assert from 'node:assert/strict';

const apiUrl = process.env.CITYFLOW_API_URL;
const citizenToken = process.env.CITYFLOW_E2E_CITIZEN_TOKEN;
const agentToken = process.env.CITYFLOW_E2E_AGENT_TOKEN;

if (!apiUrl || !citizenToken || !agentToken) {
  throw new Error('CITYFLOW_API_URL, CITYFLOW_E2E_CITIZEN_TOKEN and CITYFLOW_E2E_AGENT_TOKEN are required');
}
if (/prod(uction)?/i.test(apiUrl)) throw new Error('production targets are forbidden');

async function request(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${apiUrl.replace(/\/$/, '')}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${method} ${path} failed: ${response.status} ${JSON.stringify(payload)}`);
  return payload;
}

const created = await request('/api/v1/citizen/requests', {
  token: citizenToken,
  method: 'POST',
  body: {
    title: 'Lampadaire brisé E2E',
    description: 'Le lampadaire devant le 123 rue Principale ne fonctionne plus.',
    category: 'LIGHTING',
    location: { type: 'Point', coordinates: [-73.57, 45.5] }
  }
});
assert.ok(created.id);
assert.equal(created.status, 'SUBMITTED');

const assigned = await request(`/api/v1/citizen/requests/${created.id}/assign`, {
  token: agentToken,
  method: 'POST',
  body: { team: 'EQUIPE-TERRAIN-1' }
});
assert.equal(assigned.status, 'IN_REVIEW');

const progressed = await request(`/api/v1/citizen/requests/${created.id}/status`, {
  token: agentToken,
  method: 'POST',
  body: { status: 'IN_PROGRESS' }
});
assert.equal(progressed.status, 'IN_PROGRESS');

const resolved = await request(`/api/v1/citizen/requests/${created.id}/status`, {
  token: agentToken,
  method: 'POST',
  body: { status: 'RESOLVED', resolution: 'Ampoule remplacée.' }
});
assert.equal(resolved.status, 'RESOLVED');

const timeline = await request(`/api/v1/citizen/requests/${created.id}`, { token: citizenToken });
assert.equal(timeline.id, created.id);
assert.ok(Array.isArray(timeline.events));
assert.ok(timeline.events.length >= 3);

const notifications = await request('/api/v1/notifications?eventType=REQUEST_UPDATED', { token: citizenToken });
assert.ok(Array.isArray(notifications.items));
assert.ok(notifications.items.some((item) => item.resourceId === created.id));

console.log(`Citizen lifecycle validated for ${created.id}`);
