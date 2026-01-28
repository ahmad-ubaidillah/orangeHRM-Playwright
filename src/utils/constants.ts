export const CONSTANTS = {
  TIMEOUTS: {
    SHORT: 1000,
    MEDIUM: 2000,
    DEFAULT: 5000,
    LONG: 20000,
    NAVIGATION: 15000,
    API_WAIT: 30000,
    TYPING_DELAY: 200,
  },
  MESSAGES: {
    SUCCESS_SAVE: 'Success',
    SUCCESS_DELETE: 'Successfully Deleted',
    NO_RECORDS: 'No Records Found'
  },
  URLS: {
    LOGIN: '/web/index.php/auth/login',
    DASHBOARD: '/web/index.php/dashboard/index',
    PIM: '/web/index.php/pim/viewEmployeeList',
    PIM_ADD: '/web/index.php/pim/addEmployee',
    ADMIN: '/web/index.php/admin/viewSystemUsers',
    ADMIN_ADD: '/web/index.php/admin/saveSystemUser'
  },
  ENDPOINTS: {
    EMPLOYEES: '/pim/employees',
    USERS: '/admin/users',
    EMPLOYEES_DETAILED: /\/pim\/employees\?limit=50/,
    EMPLOYEE_SEARCH: /\/pim\/employees\?limit=50.*employeeId=\d+/,
    PIM_LIST: /\/pim\/employees\?limit=50.*model=detailed.*includeEmployees=onlyCurrent/,
    ADMIN_LIST: /\/admin\/users\?limit=50.*sortField=u\.userName/,
    PROFILE_PHOTO: /\/pim\/viewPhoto\/empNumber\/\d+/,
  },
  API: {
    BASE: '/web/index.php/api/v2',
    EMPLOYEES: '/pim/employees',
    USERS: '/admin/users'
  },
  ROLES: {
    ADMIN: 'Admin',
    ESS: 'ESS'
  },
  STATUS: {
    ENABLED: 'Enabled',
    DISABLED: 'Disabled'
  }
}
