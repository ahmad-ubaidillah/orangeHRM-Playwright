import { test, expect } from "../../src/fixtures/page-fixtures"
import { generateEmployeeData, generateUserCredentials } from "../../src/utils/test-data"
import { CONSTANTS } from "../../src/utils/constants"

test.describe('Employee CRUD @regression', () => {
  test.describe.configure({ mode: 'serial' });

  let testEmployeeData: ReturnType<typeof generateEmployeeData>;
  let updateEmployeeData: Partial<ReturnType<typeof generateEmployeeData>>;
  let essUserData: ReturnType<typeof generateUserCredentials>;

  // Setup test data once before all tests
  test.beforeAll(() => {
    testEmployeeData = generateEmployeeData();
    updateEmployeeData = {
      firstName: 'NewFirstName',
      middleName: 'NewMiddleName',
      lastName: 'NewLastName'
    };
    // Generate credentials based on the employee data
    essUserData = generateUserCredentials(
      testEmployeeData.firstName,
      testEmployeeData.middleName,
      testEmployeeData.lastName
    );
  });

  test("01 - create employee with random data", async ({ ensureAuthenticated, employeePage }) => {
    await test.step("Authenticate and Navigate", async () => {
      await ensureAuthenticated()
      await employeePage.navigateToPIM()
    });

    await test.step("Fill and Save New Employee", async () => {
      await employeePage.navigateToAddEmployee()
      await employeePage.fillEmployeeDetails(testEmployeeData.firstName, testEmployeeData.middleName, testEmployeeData.lastName, testEmployeeData.employeeId)
    });

    await test.step("Verify ID and Save", async () => {
      const capturedId = await employeePage.getEmployeeId()
      expect(capturedId).toBe(testEmployeeData.employeeId)
      await employeePage.saveEmployee()
    });
  });

  test("02 - search and verify created employee", async ({ ensureAuthenticated, employeePage }) => {
    await ensureAuthenticated()
    await test.step("Search New Employee", async () => {
      await employeePage.navigateToPIM()
      await employeePage.searchEmployeeById(testEmployeeData.employeeId)
    });

    await test.step("Verify Employee in Table", async () => {
      await employeePage.verifyEmployeeInTable(testEmployeeData.firstName, testEmployeeData.middleName, testEmployeeData.lastName)
    });
  });

  test("03 - create ESS user with role assignment (Admin menu)", async ({ ensureAuthenticated, adminPage }) => {
    await ensureAuthenticated()
    await test.step("Navigate to Admin & Add User", async () => {
      await adminPage.navigateToAdmin()
      await adminPage.clickAdd()
    });

    await test.step("Fill User Details", async () => {
      await adminPage.selectUserRole(CONSTANTS.ROLES.ESS)
      await adminPage.selectStatus(CONSTANTS.STATUS.ENABLED)
      await adminPage.fillUserDetails(
        `${testEmployeeData.firstName} ${testEmployeeData.middleName} ${testEmployeeData.lastName}`,
        essUserData.username,
        essUserData.password
      )
    });

    await test.step("Save User", async () => {
      await adminPage.saveUser()
    });
  });

  test("04 - verify ESS user in search", async ({ ensureAuthenticated, adminPage }) => {
    await ensureAuthenticated()
    await test.step("Search User", async () => {
      await adminPage.navigateToAdmin()
      await adminPage.searchUser(essUserData.username)
    });

    await test.step("Verify User Table", async () => {
      await adminPage.verifyUserInTable(essUserData.username)
    });
  });

  test("05 - login as ESS user to verify access", async ({ browser }) => {
    // Create a new context to emulate a second user (ESS) without logging out Admin
    const context = await browser.newContext();
    const page = await context.newPage();
    const loginPage = new (require('../../src/pages/LoginPage').default)(page);
    const dashboardPage = new (require('../../src/pages/DashboardPage').default)(page);

    await test.step("Login as ESS User (New Context)", async () => {
      await page.goto(CONSTANTS.URLS.LOGIN);
      await loginPage.usernameInput.waitFor({ state: "visible", timeout: CONSTANTS.TIMEOUTS.NAVIGATION });
      await loginPage.login(essUserData.username, essUserData.password)
    });

    await test.step("Verify ESS Dashboard Access", async () => {
      await dashboardPage.validateDashboard()
      await expect(dashboardPage.profile, "Profile should be visible after successful login").toBeVisible()
      await expect(dashboardPage.profile).toContainText(testEmployeeData.firstName, { ignoreCase: true });
    });

    await test.step("Close ESS Context", async () => {
      await context.close()
    });
  });

  test("07 - verify Admin session still active", async ({ ensureAuthenticated }) => {
    await ensureAuthenticated()
  });

  test("08 - update employee details", async ({ ensureAuthenticated, employeePage }) => {
    await ensureAuthenticated()

    await test.step("Find Employee to Update", async () => {
      await employeePage.navigateToPIM()
      await employeePage.searchEmployeeById(testEmployeeData.employeeId)
      await employeePage.clickEmployeeName()
    });

    await test.step("Update Name", async () => {
      await employeePage.updateEmployeeName(updateEmployeeData.firstName!, updateEmployeeData.middleName!, updateEmployeeData.lastName!)
      await employeePage.saveEmployee()
    });
  });

  test("09 - verify updated employee", async ({ ensureAuthenticated, employeePage }) => {
    await ensureAuthenticated()
    await test.step("Search Updated Employee", async () => {
      await employeePage.navigateToPIM()
      await employeePage.searchEmployeeById(testEmployeeData.employeeId)
    });

    await test.step("Verify New Details", async () => {
      await employeePage.verifyEmployeeInTable(updateEmployeeData.firstName!, updateEmployeeData.middleName!, updateEmployeeData.lastName!)
    });
  });

  test("10 - delete employee", async ({ ensureAuthenticated, employeePage }) => {
    await ensureAuthenticated()
    await test.step("Find and Delete Employee", async () => {
      await employeePage.navigateToPIM()
      await employeePage.searchEmployeeById(testEmployeeData.employeeId)
      await employeePage.clickDeleteEmployee()
      await employeePage.confirmDelete()
    });
  });

  test("11 - verify employee deleted", async ({ ensureAuthenticated, employeePage }) => {
    await ensureAuthenticated()
    await test.step("Verify No Records Found", async () => {
      await employeePage.navigateToPIM()
      await employeePage.searchEmployeeById(testEmployeeData.employeeId)
      await employeePage.verifyNoRecords()
    });
  });

  test("12 - search non-existent employee", async ({ ensureAuthenticated, employeePage }) => {
    const randomName = "Prabowo Subianto" // Just a random name for negative testing
    await ensureAuthenticated()
    await test.step("Negative Test Search", async () => {
      await employeePage.navigateToPIM()
      await employeePage.searchEmployee(randomName)
      await employeePage.verifyNoRecords()
    });
  });
});
