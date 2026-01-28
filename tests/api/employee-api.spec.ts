import { test, expect } from '@playwright/test';
import { generateEmployeeData } from '../../src/utils/test-data';
import { CONSTANTS } from '../../src/utils/constants';

test.describe('API - Employee Management @api', () => {
  test.describe.configure({ mode: 'serial' });

  let employeeData: ReturnType<typeof generateEmployeeData>;
  let empNumber: number; 

  test.beforeAll(async () => {
    employeeData = generateEmployeeData();
  });

  test('01 - POST /pim/employees - Create New Employee', async ({ request }) => {
    const payload = {
      firstName: employeeData.firstName,
      middleName: employeeData.middleName,
      lastName: employeeData.lastName,
      employeeId: employeeData.employeeId,
      empPicture: null
    };

    const response = await request.post(`${CONSTANTS.API.BASE}${CONSTANTS.API.EMPLOYEES}`, {
      data: payload
    });

    expect(response.status()).toBe(200);
    
    const body = await response.json();
    empNumber = body.data.empNumber; 
  });

  test('02 - GET /pim/employees/{id} - Verify Created Employee', async ({ request }) => {
    const response = await request.get(`${CONSTANTS.API.BASE}${CONSTANTS.API.EMPLOYEES}?limit=50&offset=0&model=detailed&includeEmployees=onlyCurrent&employeeId=${employeeData.employeeId}`);
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    const employees = body.data;
    const found = employees.find((e: any) => e.employeeId === employeeData.employeeId);
    expect(found).toBeDefined();
    expect(found.firstName).toBe(employeeData.firstName);
  });

  test('03 - PUT /pim/employees/{id} - Update Employee', async ({ request }) => {
    const updatePayload = {
      firstName: employeeData.firstName,
      middleName: employeeData.middleName,
      lastName: `${employeeData.lastName}Updated`,
      employeeId: employeeData.employeeId
    };

    const response = await request.put(`${CONSTANTS.API.BASE}${CONSTANTS.API.EMPLOYEES}/${empNumber}/personal-details`, {
      data: updatePayload
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.lastName).toBe(`${employeeData.lastName}Updated`);
  });

  test('04 - DELETE /pim/employees - Delete Employee', async ({ request }) => {
    // Delete the employee from the system using the employee number (empNumber).
    const response = await request.delete(`${CONSTANTS.API.BASE}${CONSTANTS.API.EMPLOYEES}`, {
      data: {
        ids: [empNumber]
      }
    });

    expect(response.status()).toBe(200);
  });

  test('05 - GET /pim/employees - Verify Deletion', async ({ request }) => {
    // Ensure the data is completely gone from the search results.
    const response = await request.get(`${CONSTANTS.API.BASE}${CONSTANTS.API.EMPLOYEES}?employeeId=${employeeData.employeeId}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    const found = body.data.find((e: any) => e.employeeId === employeeData.employeeId);
    expect(found).toBeUndefined();
  });
});
