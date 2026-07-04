import http from 'k6/http';
import { check, sleep } from 'k6';

// Smoke test options: 1 user, brief duration
export const options = {
  vus: 1,
  duration: '10s',
};

// Target environment URL
const BASE_URL = __ENV.TARGET_URL || 'https://cth-lms.vercel.app';

export default function () {
  const responses = http.batch([
    ['GET', `${BASE_URL}/api/health`, null],
    ['GET', `${BASE_URL}/api/courses`, null]
  ]);

  // Ensure health check is up
  check(responses[0], {
    'health status is 200': (r) => r.status === 200,
    'health json body valid': (r) => !!r.json('status')
  });

  // Ensure public courses endpoint responds properly
  check(responses[1], {
    'courses status is 200': (r) => r.status === 200,
    'courses latency < 500ms': (r) => r.timings.duration < 500
  });

  sleep(1);
}
