import { Page, Locator, expect } from "@playwright/test"
import BasePage, { TableComponent } from "./BasePage"
import { CONSTANTS } from "../utils/constants"

export default class AdminPage extends BasePage {
  readonly table: TableComponent
  readonly userRoleDropdown: Locator
  readonly statusDropdown: Locator
  readonly employeeNameInput: Locator
  readonly saveBtn: Locator
  readonly searchBtn: Locator
  readonly resetBtn: Locator
  readonly confirmDeleteBtn: Locator
  readonly listbox: Locator
  readonly addFormContainer: Locator
  readonly addFormUsernameInput: Locator
  readonly addFormPasswordInput: Locator
  readonly addFormConfirmPasswordInput: Locator
  readonly searchFilterUsernameInput: Locator

  constructor(page: Page) {
    super(page)
    this.table = new TableComponent(page)
    this.addFormContainer = page.locator('.orangehrm-card-container')
    this.userRoleDropdown = this.addFormContainer.locator('.oxd-input-group:has-text("User Role") .oxd-select-text')
    this.statusDropdown = this.addFormContainer.locator('.oxd-input-group:has-text("Status") .oxd-select-text')
    this.employeeNameInput = this.addFormContainer.locator('.oxd-input-group:has-text("Employee Name") input')
    this.addFormUsernameInput = this.addFormContainer.locator('.oxd-input-group:has-text("Username") input')
    this.addFormPasswordInput = this.addFormContainer.locator('.oxd-input-group:has-text("Password") input[type="password"]').first()
    this.addFormConfirmPasswordInput = this.addFormContainer.locator('.oxd-input-group:has-text("Confirm Password") input[type="password"]').first()
    this.saveBtn = this.addFormContainer.locator('.oxd-form-actions button[type="submit"]')
    
    this.searchBtn = page.locator('.oxd-table-filter button[type="submit"]')
    this.resetBtn = page.getByRole('button', { name: 'Reset' })
    this.confirmDeleteBtn = page.getByRole('button', { name: 'Yes, Delete' })
    this.listbox = page.locator('.oxd-select-dropdown')
    this.searchFilterUsernameInput = page.locator('.oxd-table-filter .oxd-input-group:has-text("Username") input')
  }

  async navigateToAdmin(): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      resp => CONSTANTS.ENDPOINTS.ADMIN_LIST.test(resp.url()) && resp.status() === 200,
      { timeout: CONSTANTS.TIMEOUTS.API_WAIT }
    ).catch(() => {})

    await this.page.goto(CONSTANTS.URLS.ADMIN)
    await this.waitForLoadingComplete()
    await responsePromise
  }

  async clickAdd(): Promise<void> {
    // The photo is the last thing to load according to user feedback
    const photoPromise = this.page.waitForResponse(
        resp => CONSTANTS.ENDPOINTS.PROFILE_PHOTO.test(resp.url()) && resp.status() === 200,
        { timeout: CONSTANTS.TIMEOUTS.API_WAIT }
    ).catch(() => {})

    await this.page.goto(CONSTANTS.URLS.ADMIN_ADD)
    
    await expect(this.page.getByRole('heading', { name: 'Add User' }), "Should navigate to Add User page").toBeVisible({ timeout: CONSTANTS.TIMEOUTS.NAVIGATION })
    await this.waitForLoadingComplete()
    await photoPromise
    await expect(this.userRoleDropdown).toBeVisible()
  }

  async selectUserRole(roleName: string): Promise<void> {
    await this.userRoleDropdown.click()
    await expect(this.listbox).toBeVisible()
    await this.listbox.getByText(roleName, { exact: true }).click()
  }

  async selectStatus(statusName: string): Promise<void> {
    await this.statusDropdown.click()
    await expect(this.listbox).toBeVisible()
    await this.listbox.getByText(statusName, { exact: true }).click()
  }

  /**
   * Fills out the user creation form. 
   * Includes a retry loop to handle the autocomplete dropdown behavior.
   */
  async fillUserDetails(employeeName: string, username: string, password: string): Promise<void> {
    const searchPrefix = employeeName.split(' ')[0]
    const searchLastName = employeeName.split(' ').pop() || ''
    let found = false

    for (let i = 0; i < 3; i++) {
        try {
        await this.employeeNameInput.clear()
        
        const responsePromise = this.page.waitForResponse(
          resp => resp.url().includes(CONSTANTS.ENDPOINTS.EMPLOYEES) && resp.status() === 200,
          { timeout: CONSTANTS.TIMEOUTS.API_WAIT }
        ).catch(() => {})

        await this.employeeNameInput.pressSequentially(searchPrefix, { delay: CONSTANTS.TIMEOUTS.TYPING_DELAY })
        
        await responsePromise
        await this.page.waitForTimeout(CONSTANTS.TIMEOUTS.SHORT) 

        let option = this.page.locator('.oxd-autocomplete-option').filter({ hasText: employeeName }).first()
        
        if (!await option.isVisible()) {
            option = this.page.locator('.oxd-autocomplete-option')
                .filter({ hasText: searchPrefix })
                .filter({ hasText: searchLastName })
                .first()
        }

        if (await option.isVisible()) {
            await option.click()
            found = true
            break
        }
      } catch (e) {
        await this.page.waitForTimeout(CONSTANTS.TIMEOUTS.SHORT)
      }
    }

    if (!found) {
      throw new Error(`Could not find employee "${employeeName}" in autocomplete`)
    }
    
    await this.addFormUsernameInput.fill(username)
    await this.addFormPasswordInput.fill(password)
    await this.addFormConfirmPasswordInput.fill(password)
  }

  async saveUser(): Promise<void> {
    await this.saveBtn.click()
    await this.verifyToast(CONSTANTS.MESSAGES.SUCCESS_SAVE)
    await this.waitForLoadingComplete()
  }

  async verifySuccess(): Promise<void> {
    await this.verifyToast(CONSTANTS.MESSAGES.SUCCESS_SAVE)
  }

  async searchUser(username: string): Promise<void> {
    await this.searchFilterUsernameInput.fill(username)
    
    const responsePromise = this.page.waitForResponse(
      resp => resp.url().includes(CONSTANTS.ENDPOINTS.USERS) && resp.status() === 200,
      { timeout: CONSTANTS.TIMEOUTS.API_WAIT }
    ).catch(() => {})

    await this.searchBtn.click()
    await this.waitForLoadingComplete()
    await responsePromise
  }

  async verifyUserInTable(username: string): Promise<void> {
    await this.table.verifyRowText(username)
  }

  async verifyNoRecords(): Promise<void> {
    await this.table.verifyNoRecords()
  }

  async deleteUser(): Promise<void> {
    await this.table.clickRowAction(0, '.bi-trash')
  }

  async confirmDelete(): Promise<void> {
    await expect(this.confirmDeleteBtn).toBeVisible()
    await this.confirmDeleteBtn.click()
    // Sync: Toast appears first, then Loading hides
    await this.verifyToast(CONSTANTS.MESSAGES.SUCCESS_DELETE)
    await this.waitForLoadingComplete()
  }

  async verifyDeleteSuccess(): Promise<void> {
    await this.verifyToast(CONSTANTS.MESSAGES.SUCCESS_DELETE)
  }
}
