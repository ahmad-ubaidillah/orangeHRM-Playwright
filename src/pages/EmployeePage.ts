import { Page, Locator, expect } from "@playwright/test"
import BasePage, { TableComponent } from "./BasePage"
import { CONSTANTS } from "../utils/constants"

export default class EmployeePage extends BasePage {
  readonly table: TableComponent
  readonly firstNameInput: Locator
  readonly middleNameInput: Locator
  readonly lastNameInput: Locator
  readonly employeeIdInput: Locator
  readonly saveBtn: Locator
  readonly searchBtn: Locator
  readonly filterIdInput: Locator
  readonly filterNameInput: Locator

  constructor(page: Page) {
    super(page)
    this.table = new TableComponent(page)
    this.firstNameInput = page.locator('input[name="firstName"]')
    this.middleNameInput = page.locator('input[name="middleName"]')
    this.lastNameInput = page.locator('input[name="lastName"]')
    this.employeeIdInput = page.locator('.oxd-input-group:has-text("Employee Id") input')
    this.saveBtn = page.locator('.oxd-form:has(input[name="firstName"]) button[type="submit"]')
    this.searchBtn = page.getByRole('button', { name: 'Search' })
    this.filterIdInput = page.locator('.oxd-table-filter .oxd-input-group:has-text("Employee Id") input')
    this.filterNameInput = page.locator('.oxd-table-filter .oxd-input-group:has-text("Employee Name") input')
  }

  async navigateToPIM(): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      resp => CONSTANTS.ENDPOINTS.PIM_LIST.test(resp.url()) && resp.status() === 200,
      { timeout: CONSTANTS.TIMEOUTS.API_WAIT }
    ).catch(() => { })

    await this.page.goto(CONSTANTS.URLS.PIM)
    await this.waitForLoadingComplete()
    await responsePromise
    await expect(this.searchBtn).toBeVisible()
  }

  async navigateToAddEmployee(): Promise<void> {
    await this.page.goto(CONSTANTS.URLS.PIM_ADD)
    await this.waitForLoadingComplete()
    await expect(this.firstNameInput).toBeVisible()
  }

  async fillEmployeeDetails(firstName: string, middleName: string, lastName: string, employeeId: string): Promise<void> {
    await this.waitForLoadingComplete()
    await expect(this.firstNameInput).toBeVisible()
    await this.firstNameInput.fill(firstName)
    await this.middleNameInput.fill(middleName)
    await this.lastNameInput.fill(lastName)

    if (employeeId) {
      await this.employeeIdInput.fill(employeeId)
    }
  }

  async getEmployeeId(): Promise<string> {
    return await this.employeeIdInput.inputValue()
  }

  async saveEmployee(): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      resp => resp.url().includes(CONSTANTS.ENDPOINTS.EMPLOYEES) && (resp.request().method() === 'POST' || resp.request().method() === 'PUT') && resp.status() === 200,
      { timeout: CONSTANTS.TIMEOUTS.API_WAIT }
    ).catch(() => { })

    await this.saveBtn.click()
    await this.verifyToast(CONSTANTS.MESSAGES.SUCCESS_SAVE)
    await this.waitForLoadingComplete()
    await responsePromise
  }

  async verifySuccess(): Promise<void> {
    await this.verifyToast(CONSTANTS.MESSAGES.SUCCESS_SAVE)
  }

  async searchEmployeeById(employeeId: string): Promise<void> {
    await this.filterIdInput.fill(employeeId)
    await this.performSearch()
  }

  async searchEmployee(name: string): Promise<void> {
    await this.filterNameInput.fill(name)
    await this.performSearch()
  }

  private async performSearch(): Promise<void> {
    // Decide which API to wait for based on whether we are using filters
    const isFilteredSearch = !!(await this.filterIdInput.inputValue()) || !!(await this.filterNameInput.inputValue());
    const endpointPattern = isFilteredSearch ? CONSTANTS.ENDPOINTS.EMPLOYEE_SEARCH : CONSTANTS.ENDPOINTS.EMPLOYEES_DETAILED;

    const responsePromise = this.page.waitForResponse(
      resp => endpointPattern instanceof RegExp ? endpointPattern.test(resp.url()) : resp.url().includes(endpointPattern),
      { timeout: CONSTANTS.TIMEOUTS.API_WAIT }
    ).catch(() => { })

    await this.searchBtn.click()
    await this.waitForLoadingComplete()
    await responsePromise
  }

  async verifyEmployeeInTable(firstName: string, middleName: string, lastName: string): Promise<void> {
    await this.table.verifyRowText(firstName)
    await this.table.verifyRowText(lastName)
  }

  async verifyNoRecords(): Promise<void> {
    await this.table.verifyNoRecords()
  }

  async clickEditEmployee(): Promise<void> {
    await this.table.clickEditRow(0)
    await this.waitForLoadingComplete()
    await expect(this.firstNameInput).toBeVisible()
  }

  async updateEmployeeName(firstName: string, middleName: string, lastName: string): Promise<void> {
    await this.waitForLoadingComplete()
    await expect(this.firstNameInput).toBeVisible()
    await this.firstNameInput.fill(firstName)
    await this.middleNameInput.fill(middleName)
    await this.lastNameInput.fill(lastName)
  }

  async clickDeleteEmployee(): Promise<void> {
    await this.table.clickDeleteRow(0)
  }

  async verifyDeleteSuccess(): Promise<void> {
    await this.verifyToast(CONSTANTS.MESSAGES.SUCCESS_DELETE)
  }

  async clickEmployeeName(): Promise<void> {
    await this.waitForLoadingComplete()
    const firstRow = this.table.rows.first()
    // Click on the Employee Name cell to view details.
    await firstRow.locator('.oxd-table-cell').nth(2).click()
    await this.waitForLoadingComplete()
    await expect(this.firstNameInput).toBeVisible()
  }
}
