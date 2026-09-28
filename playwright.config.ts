import { defineConfig, devices } from "@playwright/test";
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: true,
  /* The OrangeHRM demo server drops connections and stalls, so transient
     network failures are expected. Two retries on CI, none locally -- a local
     retry would hide real regressions behind a green run. */
  retries: process.env.CI ? 2 : 0,
  /* The suite is already serial, and the demo host is slow; raising this has
     not been measured to help. Revisit if the suite gets shorter. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["list"], ["html", { open: "never" }]],
  /* Per-test budget. Generous because the demo host is slow, but not so
     generous that a genuine hang holds a worker for minutes. */
  timeout: 300 * 1000,
  expect: {
    timeout: 30 * 1000,
  },
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: "https://opensource-demo.orangehrmlive.com",
    // storageState: 'storage/auth.json',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 150 * 1000, 
    navigationTimeout: 180 * 1000,
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      testDir: '.',
      testMatch: /src\/setup\/auth\.setup\.ts/,
    },
    {
      name: "chromium",
      dependencies: ['setup'],
      testIgnore: [/auth\.spec\.ts/, /auth\.setup\.ts/],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "storage/auth.json",
      },
    },
    {
      name: "chromium-auth",
      testMatch: /auth\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "firefox",
      use: { 
        ...devices["Desktop Firefox"],
        storageState: "storage/auth.json",
      },
      dependencies: ['setup'],
      testIgnore: [/auth\.spec\.ts/, /auth\.setup\.ts/],
    },
    {
      name: "webkit",
      use: { 
        ...devices["Desktop Safari"],
        storageState: "storage/auth.json",
      },
      dependencies: ['setup'],
      testIgnore: [/auth\.spec\.ts/, /auth\.setup\.ts/],
    },
    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],
  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
