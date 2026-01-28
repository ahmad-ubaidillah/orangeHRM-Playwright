import { test, expect } from "../../src/fixtures/page-fixtures"

test.describe('Authentication Tests @smoke @auth', () => {
  test("failed login with invalid credential", async ({ basePage, loginPage })=>{
    await basePage.openApplication();
    const errorMessage =  await loginPage.invalidLogin("admin", "wrongpassword")
    expect(errorMessage).toEqual("Invalid credentials")
  })

  test("failed login without fill username", async ({ basePage, loginPage })=>{
    await basePage.openApplication();
    const errorMessage =  await loginPage.loginWithoutFill("", "admin123")
    expect(errorMessage).toEqual("Required")
  })

  test("failed login without fill password", async ({ basePage, loginPage })=>{
    await basePage.openApplication();
    const errorMessage =  await loginPage.loginWithoutFill("Admin", "")
    expect(errorMessage).toEqual("Required")
  })

  test("success logout", async ({ basePage, loginPage, dashboardPage }) => {
    await basePage.openApplication();
    await loginPage.login("Admin", "admin123")
    const breadcrumb = await dashboardPage.validateDashboard()
    expect(breadcrumb).toEqual("Dashboard")
    await dashboardPage.logout()
    // We expect to see the demo credentials container again after logging out
    await expect(loginPage.demoCredential, "demoCredential should be appear after logout").toBeVisible()
  })

  test("success login as admin", async ({ basePage, loginPage, dashboardPage }) => {
    await basePage.openApplication();
    await loginPage.login("Admin", "admin123")
    const breadcrumb = await dashboardPage.validateDashboard()
    expect(breadcrumb).toEqual("Dashboard")
  })
})
