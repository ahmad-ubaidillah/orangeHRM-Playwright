import { faker } from '@faker-js/faker'

export const getUniqueId = (): string => {
  return faker.number.int({ min: 10000, max: 999999 }).toString();
}

export const generateEmployeeData = () => {
  return {
    firstName: faker.person.firstName(),
    middleName: faker.person.middleName(),
    lastName: faker.person.lastName(),
    employeeId: getUniqueId(),
  };
}

export const generateUserCredentials = (firstName: string, middleName: string, lastName: string) => {
  const fullName = `${firstName}${middleName}${lastName}`.toLowerCase()
  return {
    username: `${fullName}${getUniqueId()}`,
    password: 'TestPassword123!',
  };
}
