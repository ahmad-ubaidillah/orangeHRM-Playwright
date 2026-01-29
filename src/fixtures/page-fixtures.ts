import { test as base, Page, expect } from '@playwright/test';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import BasePage from '../pages/BasePage';
import EmployeePage from '../pages/EmployeePage';
import AdminPage from '../pages/AdminPage';
import { CONSTANTS } from "../utils/constants"

export { expect } from '@playwright/test';

// Helper function for authentication
async function ensureAuthenticated(
  page: Page,
  dashboardPage: DashboardPage,
  loginPage: LoginPage
): Promise<void> {
  // 1. Check if we are arguably already logged in (Profile visible)
  try {
    await expect(dashboardPage.profile).toBeVisible({ timeout: 2000 }); // Quick check
    return; // We are already authenticated and on a valid page
  } catch (e) {
    // Not visible, proceed to standard flow
  }

  // 2. Navigate to Dashboard. If valid session, app stays on Dashboard. If not, redirects to Login.
  await page.goto(CONSTANTS.URLS.DASHBOARD);

  // 3. Wait for URL to settle
  await expect(page).toHaveURL(/dashboard|login/, { timeout: CONSTANTS.TIMEOUTS.NAVIGATION });

  // 4. Handle Login if needed
  if (page.url().includes('login')) {
    await loginPage.login(CONSTANTS.CREDENTIALS.USERNAME, CONSTANTS.CREDENTIALS.PASSWORD);
    await dashboardPage.validateDashboard();
  } else {
    // We are on dashboard, just validate
    await dashboardPage.validateDashboard();
  }
}

export const test = base.extend<{
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  basePage: BasePage;
  employeePage: EmployeePage;
  adminPage: AdminPage;
  ensureAuthenticated: () => Promise<void>;

  logout: () => Promise<void>;
}>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  basePage: async ({ page }, use) => {
    await use(new BasePage(page));
  },
  employeePage: async ({ page }, use) => {
    await use(new EmployeePage(page));
  },
  adminPage: async ({ page }, use) => {
    await use(new AdminPage(page));
  },
  ensureAuthenticated: async ({ page, dashboardPage, loginPage }, use) => {
    await use(async () => {
      await ensureAuthenticated(page, dashboardPage, loginPage);
    });
  },

  logout: async ({ dashboardPage }, use) => {
    await use(async () => {
      await dashboardPage.logout();
    });
  },
});
