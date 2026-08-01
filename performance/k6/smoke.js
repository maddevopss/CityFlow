import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

const baseUrl = __ENV.CITYFLOW_API_URL;
const token = __ENV.CITYFLOW_E2E_TOKEN;

export default function () {
  const response = http.get(`${baseUrl}/api/v1/health`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  check(response, {
    'health répond': (res) => res.status === 200,
  });
  sleep(1);
}
