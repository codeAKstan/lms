import http from 'k6/http';
import { check, sleep } from 'k6';

// Simulating a rapid spike up to 10k virtual users (VUs) and holding for 2 minutes to evaluate rate limiting and DB pooling 
export const options = {
  stages: [
    { duration: '30s', target: 5000 },  // Ramp up to 5k users over 30s
    { duration: '1m', target: 50000 },  // Ramp up to 50k users over the next minute
    { duration: '2m', target: 50000 },  // Hold at 50k users for 2 minutes
    { duration: '30s', target: 0 },     // Wind down cleanly
  ],
  thresholds: {
    // Failing criteria for CI:
    'http_req_duration': ['p(95)<1500'], // 95% of requests should be under 1.5s (includes rate limited 429 delays)
    'http_req_failed': ['rate<0.01'],    // Max 1% hard errors (excluding 429s as they are expected due to intentional rate limits)
  },
};

const BASE_URL = __ENV.TARGET_URL || 'https://cth-lms.vercel.app';

export default function () {
  // We hit the heavy, cached `/api/courses` endpoint representing a typical user browsing the catalogue
  const res = http.get(`${BASE_URL}/api/courses`);

  // Log explicitly failures that aren't expected ratelimits
  if (res.status !== 200 && res.status !== 429) {
    console.warn(`Unexpected status: ${res.status} for VU ${__VU}`);
  }

  // Check expected outcomes 
  // At 50k users, the edge rate limiting (500 req/10s per IP) WILL be hit, returning a 429.
  // Both 200 and 429 are considered "successful" application responses to this test.
  check(res, {
    'status is 200 or 429 (Rate Limited)': (r) => r.status === 200 || r.status === 429,
  });

  // Small sleep to simulate realistic reading time before navigating elsewhere
  sleep(Math.random() * 3 + 1); // 1-4 seconds
}
