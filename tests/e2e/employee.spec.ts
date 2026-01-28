import { test, expect } from "../../src/fixtures/page-fixtures"
import { generateEmployeeData, generateUserCredentials } from "../../src/utils/test-data"
import { CONSTANTS } from "../../src/utils/constants"

test.describe('Employee CRUD @regression', () => {
  test.describe.configure({ mode: 'serial', retries: 0 });

  let testEmployeeData: ReturnType<typeof generateEmployeeData>;
  let updateEmployeeData: {
    firstName: string;
    middleName: string;
    lastName: string;
  };
  let essUserData: {
    username: string;
    password: string;
  };

  test.beforeAll(() => {
    testEmployeeData = generateEmployeeData();
    updateEmployeeData = {
      firstName: 'NewFirstName',
      middleName: 'NewMiddleName',
      lastName: 'NewLastName'
    };
    essUserData = generateUserCredentials(testEmployeeData.firstName, testEmployeeData.middleName, testEmployeeData.lastName);
  });

  test("01 - create employee with random data", async ({ ensureAuthenticated, employeePage }) => {
    await ensureAuthenticated()
    await employeePage.navigateToPIM()
    await employeePage.navigateToAddEmployee()
    await employeePage.fillEmployeeDetails(testEmployeeData.firstName, testEmployeeData.middleName, testEmployeeData.lastName, testEmployeeData.employeeId)
    const capturedId = await employeePage.getEmployeeId()
    expect(capturedId).toBe(testEmployeeData.employeeId)
    await employeePage.saveEmployee()
  });

  test("02 - search and verify created employee", async ({ ensureAuthenticated, employeePage }) => {
    await ensureAuthenticated()
    await employeePage.navigateToPIM()
    await employeePage.searchEmployeeById(testEmployeeData.employeeId)
    await employeePage.verifyEmployeeInTable(testEmployeeData.firstName, testEmployeeData.middleName, testEmployeeData.lastName)
  });

  test("03 - create ESS user with role assignment (Admin menu)", async ({ ensureAuthenticated, adminPage }) => {
    await ensureAuthenticated()
    await adminPage.navigateToAdmin()
    await adminPage.clickAdd()
    await adminPage.selectUserRole(CONSTANTS.ROLES.ESS)
    await adminPage.selectStatus(CONSTANTS.STATUS.ENABLED)
    await adminPage.fillUserDetails(
      `${testEmployeeData.firstName} ${testEmployeeData.middleName} ${testEmployeeData.lastName}`,
      essUserData.username,
      essUserData.password
    )
    await adminPage.saveUser()
  });

  test("04 - verify ESS user in search", async ({ ensureAuthenticated, adminPage }) => {
    await ensureAuthenticated()
    await adminPage.navigateToAdmin()
    await adminPage.searchUser(essUserData.username)
    await adminPage.verifyUserInTable(essUserData.username)
  });

  test("05 - login as ESS user to verify access", async ({ ensureAuthenticated, page, loginPage, dashboardPage, logout }) => {
    // Verify that the web application allows the new user to log in correctly.
    await ensureAuthenticated()
    await logout()
    await page.goto(CONSTANTS.URLS.LOGIN, { waitUntil: 'networkidle' })
    await loginPage.login(essUserData.username, essUserData.password)
    await expect(dashboardPage.profile, "Profile should be visible after successful login").toBeVisible()
    await expect(dashboardPage.profile).toContainText(testEmployeeData.firstName, { ignoreCase: true });
  });

  test("06 - logout ESS user", async ({ logout }) => {
    await logout()
  });

  test("07 - login back as Admin", async ({ ensureAuthenticated }) => {
    await ensureAuthenticated()
  });

  test("08 - update employee details", async ({ ensureAuthenticated, employeePage }) => {
    await ensureAuthenticated()
    await employeePage.navigateToPIM()
    await employeePage.searchEmployeeById(testEmployeeData.employeeId)
    await employeePage.clickEmployeeName()
    await employeePage.updateEmployeeName(updateEmployeeData.firstName, updateEmployeeData.middleName, updateEmployeeData.lastName)
    await employeePage.saveEmployee()
  });

  test("09 - verify updated employee", async ({ ensureAuthenticated, employeePage }) => {
    await ensureAuthenticated()
    await employeePage.navigateToPIM()
    await employeePage.searchEmployeeById(testEmployeeData.employeeId)
    await employeePage.verifyEmployeeInTable(updateEmployeeData.firstName, updateEmployeeData.middleName, updateEmployeeData.lastName)
  });

  test("10 - delete employee", async ({ ensureAuthenticated, employeePage }) => {
    await ensureAuthenticated()
    await employeePage.navigateToPIM()
    await employeePage.searchEmployeeById(testEmployeeData.employeeId)
    await employeePage.clickDeleteEmployee()
    await employeePage.confirmDelete()
  });

  test("11 - verify employee deleted", async ({ ensureAuthenticated, employeePage }) => {
    await ensureAuthenticated()
    await employeePage.navigateToPIM()
    await employeePage.searchEmployeeById(testEmployeeData.employeeId) 
    await employeePage.verifyNoRecords()
  });
});

test("search non-existent employee", async ({ ensureAuthenticated, employeePage }) => {
  const randomName = "Prabowo Subianto" // Just a random name for negative testing
  await ensureAuthenticated()
  await employeePage.navigateToPIM()
  await employeePage.searchEmployee(randomName)
  await employeePage.verifyNoRecords()
});
