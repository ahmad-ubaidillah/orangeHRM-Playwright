# Automation Framework for OrangeHRM

This repository contains an automation framework for OrangeHRM using Playwright with TypeScript. The framework handles end-to-end (E2E) testing, API testing, and basic performance testing.

## Core Features

*   Page Object Model: Separation of UI locators and actions from test logic.
*   Automated Synchronization: Methods to handle loading spinners and API response waits.
*   Data Generation: Dynamic data creation for realistic testing scenarios.
*   Cross-Test Types: Support for E2E, API integration, and Load testing.
*   CI/CD Integration: Automated execution using GitHub Actions.

## Setup and Installation

Prerequisites:
*   Node.js (v16 or higher)
*   npm

Installation steps:
1.  Install project dependencies:
    ```bash
    npm install
    ```
2.  Install Playwright browser binaries:
    ```bash
    npx playwright install --with-deps
    ```

## Test Execution

### End-to-End Tests
Execute all E2E tests (headless by default):
```bash
npx playwright test tests/e2e/
```

Watch the run in a visible browser window:
```bash
npm run test:headed
```

Execute E2E tests on Chromium only (Faster):
```bash
npm run test:e2e:headless
```

Execute E2E tests across all configured browsers (Cross-browser Check):
```bash
npm run test:e2e:all
```

Execute a specific test file:
```bash
npx playwright test tests/e2e/employee.spec.ts
```

### API Tests
Execute API integration tests:
```bash
npm run test:api
```

### Typecheck
Run the TypeScript compiler without emitting files:
```bash
npm run typecheck
```

### Performance Tests
Execute load tests using k6:
```bash
npm run test:k6
```

The run writes an HTML summary to `k6-report/summary.html` and exits non-zero if
any threshold is crossed. The script prints progress to stdout; open the summary
file for the detailed breakdown.

## Project Structure

*   src/pages: Page classes containing locators and page-specific actions.
*   src/utils: Constants, configuration, and data generation utilities.
*   tests/e2e: End-to-end test scenarios.
*   tests/api: Backend API verification tests.
*   tests/performance: Load testing scripts using k6.
*   .github/workflows: Configuration for automated CI/CD execution.

## Reliability and Stability

The framework implements several strategies to ensure test execution is stable:
*   Smart Waits: Waiting for network idle, specific API responses, or the disappearance of loading elements.
*   Retry Mechanism: Configured to re-run failed tests to manage transient environment issues.
*   Independent Tests: Each test case manages its own data lifecycle (Create, Verify, Delete) where possible.

## Environment Configuration

The framework supports environment-based configuration using a `.env` file. See
`.env.example` for the available keys and copy it to `.env` to customise:

```bash
cp .env.example .env
```

```bash
# .env
BASE_URL=https://your-orangehrm-instance.com
ADMIN_USERNAME=your_admin_user
ADMIN_PASSWORD=your_admin_password
```

Only `.env` is read. The `dotenv` call in `playwright.config.ts` resolves a
single `.env` path, so `.env.local` and other variants are not picked up
automatically -- export them in your shell instead.

Environment variables used:
*   `BASE_URL`: Target OrangeHRM instance URL
*   `ADMIN_USERNAME`: Admin username for authentication
*   `ADMIN_PASSWORD`: Admin password for authentication
*   `HEADLESS`: Set to `false` to watch the run in a visible browser window
*   `RETRIES`: Number of retry attempts for failed tests
*   `WEB_TIMEOUT`: Web navigation timeout in milliseconds
*   `API_TIMEOUT`: API request timeout in milliseconds
*   `ASSERTION_TIMEOUT`: Assertion timeout in milliseconds
*   `CI`: Set to true when running in CI/CD environment
*   `REPORT_DIR`: Directory for HTML test reports

Browser selection is done with Playwright's `--project` flag (`chromium`,
`chromium-auth`, `firefox`, `webkit`), not an environment variable.

## Flaky Test Management

Flaky tests are tests that can pass or fail intermittently without any code changes. This reduces confidence in the test suite and slows down development.

### Common Causes of Flaky Tests

1. Race conditions between UI and API responses
2. Network latency or timeout issues
3. Dynamic content that loads at unpredictable times
4. Shared test data modified by parallel test runs
5. Browser timing issues with animations or transitions

### Detection Strategy

1. Monitor test results over multiple CI runs
2. Track tests that pass only on retry (tests with retry count > 0)
3. Review CI logs for timeout-related failures
4. Use Playwright trace viewer to analyze failed test steps
5. Maintain a log of frequently failing tests

### Mitigation Approach

1. **Smart Waiting**: Use API response interception instead of fixed sleep delays. The framework provides `waitForResponse()` and `waitForLoadingComplete()` methods.

2. **Data Isolation**: Generate unique test data for each test execution using dynamic data generation.

3. **Proper Cleanup**: Ensure tests delete resources they create to prevent data pollution.

4. **Retry Configuration**: Configure reasonable retry attempts for known flaky operations. Retries default to `2` on CI and `0` locally, so a local run fails loudly on a real regression. Override with `RETRIES`.

5. **Avoid Dependencies**: Do not rely on execution order between tests. Each test should be independent. Note that the Employee CRUD suite does chain its steps (create → update → delete) because each step needs the record the previous one made; the whole file must run in one go.

6. **Screenshot and Video**: Capture artifacts on failure to aid debugging.

## CI/CD Implementation

GitHub Actions is configured to run tests on every push or pull request to the main branch. The workflow performs the following:
1.  Environment setup and dependency installation.
2.  Typecheck, which fails the run before any test starts.
3.  Execution of E2E tests (Chromium and the auth project) and API tests, using the `BASE_URL`, `USERNAME` and `PASSWORD` repository secrets.
4.  A k6 load run, with the reporter pinned to the same k6 version used locally.
5.  Archiving `playwright-report/`, `test-results/` and `k6-report/` as downloadable artifacts.