import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const valid_login_rate = new Rate('valid_login_rate');
const successful_employee_creation_rate = new Rate('successful_employee_creation_rate');

export const options = {
  thresholds: {
    // 95% of requests must finish within 1000ms
    http_req_duration: ['p(95)<5000'],
    // 99% of checks must pass
    checks: ['rate>0.99'],
    // Custom metric thresholds
    valid_login_rate: ['rate>0.95'],
    successful_employee_creation_rate: ['rate>0.95'],
    http_req_failed: ['rate<0.01'],
  },
  stages: [
    { duration: '30s', target: 5 }, // Ramp up to 5 users
    { duration: '1m', target: 5 },  // Stay at 5 users
    { duration: '30s', target: 0 },  // Ramp down
  ],
};

const BASE_URL = 'https://opensource-demo.orangehrmlive.com';

const authData = JSON.parse(open('../../storage/auth.json'));
const orangehrmCookie = authData.cookies.find(c => c.name === 'orangehrm').value;

export default function () {
  // Use the cookie directly
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': `orangehrm=${orangehrmCookie}`
  };

  // 1. Check Dashboard (Make sure already logged in)
  const dashboardRes = http.get(`${BASE_URL}/web/index.php/dashboard/index`, { headers });
  
  const loginSuccess = check(dashboardRes, {
    'dashboard access successful': (r) => r.status === 200 && r.body.includes('Dashboard'),
  });
  valid_login_rate.add(loginSuccess);

  if (loginSuccess) {
    sleep(1);

    // 2. Simulate creating a new employee via API
    const employeePayload = JSON.stringify({
      firstName: `PerfUser${Math.floor(Math.random() * 1000)}`,
      middleName: 'Test',
      lastName: 'Load',
      empPicture: null
    });

    const createRes = http.post(`${BASE_URL}/web/index.php/api/v2/pim/employees`, employeePayload, { headers });

    const createSuccess = check(createRes, {
      'employee creation successful (API)': (r) => r.status === 200,
    });
    
    successful_employee_creation_rate.add(createSuccess);
  }

  sleep(1);
}
