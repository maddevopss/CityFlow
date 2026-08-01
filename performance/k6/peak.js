import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.CITYFLOW_API_URL;

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '30s', target: 0 }
  ],
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<750', 'p(99)<1500']
  }
};

export default function () {
  const response = http.get(`${baseUrl}/health`);
  check(response, { 'health reste disponible': (r) => r.status === 200 });
  sleep(0.2);
}
