import { Page, Locator, expect } from "@playwright/test"
import BasePage from "./BasePage"
import LoginPage from "./LoginPage"
import { CONSTANTS } from "../utils/constants"

export default class DashboardPage extends BasePage {
  readonly breadcrumb: Locator
  readonly profile: Locator
  readonly signout: Locator
  readonly widget: Locator

  constructor(page: Page){
    super(page)
    this.breadcrumb = page.locator('.oxd-topbar-header-breadcrumb-module');
    this.profile = page.locator('.oxd-userdropdown-tab');
    this.signout = page.getByRole('menuitem', { name: 'Logout' });
    this.widget = page.locator('.oxd-sheet').first();
  }

  async navigateToDashboard(): Promise<void> {
    await this.page.goto(CONSTANTS.URLS.DASHBOARD);
    await this.waitForLoadingComplete()
  }

  async validateDashboard(): Promise<string> {
    await this.waitForLoadingComplete()
    await expect(
      this.widget,
      'Dashboard widget should be visible after successful login'
    ).toBeVisible();
    await expect(this.breadcrumb, "this breadcrumb should appear on every page").toBeVisible();
    return await this.breadcrumb.textContent() ?? '';
  }

  async logout(): Promise<void> {
    const loginPage = new LoginPage(this.page)
    if (await this.profile.isVisible().catch(() => false)) {
      await this.profile.click();
      await expect(this.signout).toBeVisible();
      await this.signout.click();
      await expect(loginPage.usernameInput).toBeVisible();
    }
  }
}
