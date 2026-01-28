import { Page, Locator, expect } from "@playwright/test"
import BasePage from "./BasePage"

export default class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly inputError: Locator;
  readonly demoCredential: Locator

  constructor(page : Page){
    super(page);
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.oxd-alert-content-text');
    this.inputError = page.locator('.oxd-input-field-error-message')
    this.demoCredential = page.locator(".orangehrm-demo-credentials")
  }

  async login(username: string, password: string): Promise<void>{
    await expect(this.usernameInput).toBeVisible();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async invalidLogin(username: string, password: string): Promise<string>{
    await expect(this.usernameInput).toBeVisible();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await expect(this.errorMessage, "this error should appear for Invalid login").toBeVisible();
    return await this.errorMessage.textContent() ?? '';
  }

  async loginWithoutFill(username: string, password: string): Promise<string>{
    await expect(this.usernameInput).toBeVisible();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await expect(this.inputError, "Required field error should appear").toBeVisible();
    return await this.inputError.textContent() ?? '';
  }
}