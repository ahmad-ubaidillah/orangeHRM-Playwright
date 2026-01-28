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
Execute all E2E tests:
```bash
npx playwright test tests/e2e/
```

Execute a specific test file:
```bash
npx playwright test tests/e2e/employee.spec.ts
```

### API Tests
Execute API integration tests:
```bash
npx playwright test tests/api/
```

### Performance Tests
Execute load tests using k6:
```bash
k6 run tests/performance/load-test.js
```

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

## CI/CD Implementation

GitHub Actions is configured to run tests on every push or pull request to the main branch. The workflow performs the following:
1.  Environment setup and dependency installation.
2.  Sequential execution of E2E, API, and k6 tests.
3.  Archiving test reports and results as downloadable artifacts.
