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
  // Go to login page - if already authenticated via storageState, server redirects to dashboard
  await page.goto('/web/index.php/auth/login')
  
  // Wait for the URL to resolve to either dashboard (redirect) or login (no session)
  await expect(page).toHaveURL(/dashboard|login/, { timeout: CONSTANTS.TIMEOUTS.DEFAULT});

  // If we landed on dashboard, we hit the storageState cache. 
  // We MUST still validate that the dashboard is loaded before returning.
  if (page.url().includes('dashboard')) {
    await dashboardPage.validateDashboard()
    return
  }

  // Otherwise, perform manual login
  await loginPage.login('Admin', 'admin123')
  await dashboardPage.validateDashboard()
}

export const test = base.extend<{
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  basePage: BasePage;
  employeePage: EmployeePage;
  adminPage: AdminPage;
  ensureAuthenticated: () => Promise<void>;
  loginAsUser: (username: string, password: string) => Promise<void>;
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
  loginAsUser: async ({ page, dashboardPage, loginPage }, use) => {
    await use(async (username: string, password: string) => {
      await page.goto('/web/index.php/auth/login')
      await loginPage.login(username, password)
      await dashboardPage.validateDashboard()
    });
  },
  logout: async ({ dashboardPage }, use) => {
    await use(async () => {
      await dashboardPage.logout();
    });
  },
});
