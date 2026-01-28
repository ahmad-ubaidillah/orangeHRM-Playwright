
import { test as setup, expect } from '../fixtures/page-fixtures';

const authFile = 'storage/auth.json';

setup('authenticate', async ({ page, loginPage, dashboardPage }) => {
  await page.goto('/web/index.php/auth/login');
  await loginPage.login('Admin', 'admin123');
  await expect(dashboardPage.profile).toBeVisible();
  await page.context().storageState({ path: authFile });
});
