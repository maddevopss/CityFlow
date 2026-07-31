import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.CITYFLOW_BASE_URL || 'http://127.0.0.1:3000';
const token = __ENV.CITYFLOW_METRICS_TOKEN;

if (!token) {
  throw new Error('CITYFLOW_METRICS_TOKEN is required');
}

export const options = {
  scenarios: {
    steady_metrics_reads: {
      executor: 'constant-arrival-rate',
      rate: Number(__ENV.CITYFLOW_REQUEST_RATE || 10),
      timeUnit: '1s',
      duration: __ENV.CITYFLOW_TEST_DURATION || '2m',
      preAllocatedVUs: 10,
      maxVUs: 100,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    checks: ['rate>0.99'],
  },
};

export default function () {
  const response = http.get(`${baseUrl}/metrics`, {
    headers: { Authorization: `Bearer ${token}` },
    tags: { endpoint: 'metrics' },
  });

  check(response, {
    'status is 200': (res) => res.status === 200,
    'content type is prometheus': (res) =>
      String(res.headers['Content-Type'] || '').includes('text/plain'),
    'health metric exists': (res) =>
      res.body.includes('cityflow_diffusion_health'),
  });

  sleep(0.1);
}
