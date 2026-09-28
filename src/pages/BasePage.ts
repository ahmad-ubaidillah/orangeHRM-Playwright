import { Page, Locator, expect } from "@playwright/test"

import { CONSTANTS } from "../utils/constants"

export default class BasePage {
  readonly page: Page;
  readonly loadingSpinner: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    this.page = page
    this.loadingSpinner = page.locator('.oxd-loading-spinner').first()
    this.successToast = page.locator('.oxd-toast--success')
  }

  async openApplication(): Promise<void> {
    await this.page.goto(CONSTANTS.URLS.LOGIN);
    await expect(this.page.locator('input[name="username"]')).toBeVisible();
  }

  /**
   * Waits for all loading animations to finish.
   * This ensures the page is stable before performing actions.
   */
  async waitForLoadingComplete(timeout: number = CONSTANTS.TIMEOUTS.LONG): Promise<void> {
    await expect(this.page.locator('.oxd-loading-spinner:visible'), "Wait for spinners to disappear").toHaveCount(0, { timeout })
  }

  async verifyToast(message: string = CONSTANTS.MESSAGES.SUCCESS_SAVE): Promise<void> {
    await expect(this.successToast).toBeVisible({ timeout: CONSTANTS.TIMEOUTS.LONG })
    if (message) {
      await expect(this.successToast).toContainText(message)
    }
  }

  async refresh(): Promise<void> {
    await this.page.reload({ waitUntil: 'networkidle' })
    await this.waitForLoadingComplete()
  }

  async confirmDelete(): Promise<void> {
    const confirmBtn = this.page.getByRole('button', { name: 'Yes, Delete' })
    await expect(confirmBtn).toBeVisible()
    await confirmBtn.click()
    await this.verifyToast(CONSTANTS.MESSAGES.SUCCESS_DELETE)
    await this.waitForLoadingComplete()
  }
}

/**
 * Helper class to handle table interactions like searching and verification.
 */
export class TableComponent {
  readonly page: Page
  readonly tableBody: Locator
  readonly rows: Locator
  readonly noRecordsMsg: Locator
  readonly loadingSpinner: Locator

  constructor(page: Page) {
    this.page = page
    this.tableBody = page.locator('.oxd-table-body')
    this.rows = page.locator('.oxd-table-card')
    this.noRecordsMsg = page.getByText(CONSTANTS.MESSAGES.NO_RECORDS).first()
    this.loadingSpinner = page.locator('.oxd-loading-spinner')
  }

  async waitForLoading(): Promise<void> {
    await expect(this.page.locator('.oxd-loading-spinner:visible')).toHaveCount(0, { timeout: CONSTANTS.TIMEOUTS.LONG })
  }

  async verifyRowText(text: string): Promise<void> {
    await this.waitForLoading()
    await expect(this.tableBody).toContainText(text, { ignoreCase: true })
  }

  async verifyNoRecords(): Promise<void> {
    await this.waitForLoading()
    await expect(this.noRecordsMsg).toBeVisible()
  }

  async clickRowAction(rowIndex: number, actionIconClass: string): Promise<void> {
    await this.waitForLoading()
    const row = this.rows.nth(rowIndex)
    await expect(row).toBeVisible()
    await row.locator(actionIconClass).first().click()
  }

  async clickEditRow(rowIndex: number = 0): Promise<void> {
    await this.clickRowAction(rowIndex, '.bi-pencil-fill')
  }

  async clickDeleteRow(rowIndex: number = 0): Promise<void> {
    await this.clickRowAction(rowIndex, '.bi-trash')
  }
}
