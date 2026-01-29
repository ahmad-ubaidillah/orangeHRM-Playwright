import { test, expect } from "../../src/fixtures/page-fixtures"
import { CONSTANTS } from "../../src/utils/constants"

test.describe('Authentication Tests @smoke @auth', () => {
  test("failed login with invalid credential", async ({ basePage, loginPage }) => {
    await test.step("Navigate to Login", async () => {
      await basePage.openApplication();
    });

    await test.step("Attempt Invalid Login", async () => {
      const errorMessage = await loginPage.invalidLogin("admin", "wrongpassword")
      expect(errorMessage).toEqual("Invalid credentials")
    });
  })

  test("failed login without fill username", async ({ basePage, loginPage }) => {
    await test.step("Navigate to Login", async () => {
      await basePage.openApplication();
    });

    await test.step("Submit Empty Username", async () => {
      const errorMessage = await loginPage.loginWithoutFill("", CONSTANTS.CREDENTIALS.PASSWORD)
      expect(errorMessage).toEqual("Required")
    });
  })

  test("failed login without fill password", async ({ basePage, loginPage }) => {
    await test.step("Navigate to Login", async () => {
      await basePage.openApplication();
    });

    await test.step("Submit Empty Password", async () => {
      const errorMessage = await loginPage.loginWithoutFill(CONSTANTS.CREDENTIALS.USERNAME, "")
      expect(errorMessage).toEqual("Required")
    });
  })

  test("success logout", async ({ basePage, loginPage, dashboardPage }) => {
    await test.step("Login as Admin", async () => {
      await basePage.openApplication();
      await loginPage.login(CONSTANTS.CREDENTIALS.USERNAME, CONSTANTS.CREDENTIALS.PASSWORD)
    });

    await test.step("Verify Dashboard", async () => {
      const breadcrumb = await dashboardPage.validateDashboard()
      expect(breadcrumb).toEqual("Dashboard")
    });

    await test.step("Logout", async () => {
      await dashboardPage.logout()
      // We expect to see the demo credentials container again after logging out
      await expect(loginPage.demoCredential, "demoCredential should be appear after logout").toBeVisible()
    });
  })

  test("success login as admin", async ({ basePage, loginPage, dashboardPage }) => {
    await test.step("Login Flow", async () => {
      await basePage.openApplication();
      await loginPage.login(CONSTANTS.CREDENTIALS.USERNAME, CONSTANTS.CREDENTIALS.PASSWORD)
    });

    await test.step("Verify Dashboard Access", async () => {
      const breadcrumb = await dashboardPage.validateDashboard()
      expect(breadcrumb).toEqual("Dashboard")
    });
  })
})
