
import { test as setup, expect } from '../fixtures/page-fixtures';
import { CONSTANTS } from '../utils/constants';

const authFile = 'storage/auth.json';

setup('authenticate', async ({ page, loginPage, dashboardPage }) => {
  await page.goto('/web/index.php/auth/login');
  await loginPage.login(CONSTANTS.CREDENTIALS.USERNAME, CONSTANTS.CREDENTIALS.PASSWORD);
  await expect(dashboardPage.profile).toBeVisible();
  await page.context().storageState({ path: authFile });
});
