import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5m', target: 20 },
    { duration: '50m', target: 20 },
    { duration: '5m', target: 0 }
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<750', 'p(99)<1500']
  }
};

const baseUrl = __ENV.CITYFLOW_API_URL;
const token = __ENV.CITYFLOW_E2E_TOKEN;

export default function () {
  const response = http.get(`${baseUrl}/health`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  check(response, { 'health 200': (r) => r.status === 200 });
  sleep(1);
}
