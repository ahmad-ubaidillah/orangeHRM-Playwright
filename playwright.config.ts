import { defineConfig, devices } from "@playwright/test";
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI and Local */
  retries: process.env.RETRIES ? parseInt(process.env.RETRIES) : 2,
  /* Opt out of parallel tests on CI. Local can now handle 4 workers comfortably with optimization. */
  workers: process.env.CI ? 1 : 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html", { outputFolder: process.env.REPORT_DIR || "playwright-report" }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  timeout: process.env.API_TIMEOUT ? parseInt(process.env.API_TIMEOUT) : 180 * 1000,
  expect: {
    timeout: process.env.ASSERTION_TIMEOUT ? parseInt(process.env.ASSERTION_TIMEOUT) : 150 * 1000,
  },
  use: {
    headless: process.env.HEADLESS === 'true',
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.BASE_URL || "https://opensource-demo.orangehrmlive.com",
    // storageState: 'storage/auth.json',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: process.env.ASSERTION_TIMEOUT ? parseInt(process.env.ASSERTION_TIMEOUT) : 150 * 1000,
    navigationTimeout: process.env.WEB_TIMEOUT ? parseInt(process.env.WEB_TIMEOUT) : 180 * 1000,
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


  ],

});
