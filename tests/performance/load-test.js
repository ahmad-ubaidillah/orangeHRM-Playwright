import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const valid_session_rate = new Rate('valid_session_rate');
const successful_employee_creation_rate = new Rate('successful_employee_creation_rate');
const failed_sessions = new Counter('failed_sessions');
const employee_create_latency = new Trend('employee_create_latency');

export const options = {
  thresholds: {
    // The demo host is shared and slow; p95 under 5s is a realistic bar.
    http_req_duration: ['p(95)<5000'],
    checks: ['rate>0.99'],
    valid_session_rate: ['rate>0.95'],
    successful_employee_creation_rate: ['rate>0.95'],
    http_req_failed: ['rate<0.01'],
  },
  stages: [
    { duration: '15s', target: 3 },
    { duration: '30s', target: 3 },
    { duration: '10s', target: 0 },
  ],
};

const BASE_URL = 'https://opensource-demo.orangehrmlive.com';
const LOGIN_PAGE = `${BASE_URL}/web/index.php/auth/login`;
const LOGIN_URL = `${BASE_URL}/web/index.php/auth/validate`;
const DASHBOARD_API = `${BASE_URL}/web/index.php/api/v2/dashboard/shortcuts`;
const API_EMPLOYEES = `${BASE_URL}/web/index.php/api/v2/pim/employees`;

/**
 * Logs this VU in and relies on k6's per-VU cookie jar for the session.
 *
 * The original test read storage/auth.json, but that is a Playwright
 * storageState artifact which expires -- a fresh run bounced to the login
 * component and failed every check (0 of 230 passed).
 *
 * A shared setup() session does not work either: the cookie issued to the
 * login page is only upgraded to an authenticated session inside the VU that
 * performed the validate POST, so replaying it from other VUs returned
 * 401 "Session expired".
 *
 * The demo host also drops the session on its own between iterations, so the
 * caller re-authenticates on any 401 rather than trusting a long-lived login.
 * The demo account is shared, so VUs stay low.
 */
function login() {
  // The login page embeds a CSRF token and issues a pre-auth session cookie;
  // both are required for the validate POST to succeed.
  const loginPage = http.get(LOGIN_PAGE);
  const token = (loginPage.body.match(/:token="&quot;([^&]+)&quot;"/) || [])[1] || '';

  http.post(
    LOGIN_URL,
    { _token: token, username: 'Admin', password: 'admin123' },
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );
}

const jsonHeaders = { Accept: 'application/json' };

export default function () {
  // 1. Dashboard read through the JSON API.
  //
  // OrangeHRM 5.9 is a Vue SPA: the HTML served for /dashboard/index is the
  // same shell whether or not the caller is authenticated, and the content is
  // rendered client-side. k6 does not run JavaScript, so the old assertion on
  // the word "Dashboard" in the HTML body could never pass. The API returns
  // real JSON and is a meaningful check for a non-JS client.
  login();
  let dashRes = http.get(DASHBOARD_API, { headers: jsonHeaders });

  // The shared demo session is invalidated server-side between iterations.
  // Re-authenticate once and retry rather than reporting a false failure.
  if (dashRes.status === 401) {
    failed_sessions.add(1);
    login();
    dashRes = http.get(DASHBOARD_API, { headers: jsonHeaders });
  }

  const sessionValid = check(dashRes, {
    'dashboard API returns 200': (r) => r.status === 200,
    'dashboard API returns JSON': (r) => (r.headers['Content-Type'] || '').includes('application/json'),
  });
  valid_session_rate.add(sessionValid);

  if (!sessionValid) {
    failed_sessions.add(1);
    sleep(1);
    return;
  }

  sleep(1);

  // 2. Employee creation via the REST API, which is server-rendered JSON and
  //    therefore safe to assert on from a non-JS client.
  const employeePayload = JSON.stringify({
    firstName: `PerfUser${__VU}${__ITER}`,
    middleName: 'Test',
    lastName: 'Load',
    empPicture: null,
  });

  const createRes = http.post(API_EMPLOYEES, employeePayload, {
    headers: { ...jsonHeaders, 'Content-Type': 'application/json' },
  });

  const createSuccess = check(createRes, {
    'employee creation successful (API)': (r) => r.status === 200,
  });
  successful_employee_creation_rate.add(createSuccess);
  employee_create_latency.add(createRes.timings.duration);

  sleep(1);
}
