import { addWeeks } from 'date-fns';
import { AppDataSource } from '../dataSource';
import { Customer } from '../entities/Customer';

const customerRepository = AppDataSource.getRepository(Customer);

async function addCustomer(
  firstName: string,
  lastName: string,
  username: string,
  password: string,
  email: string,
  phone: string,
  dateOfBirth: Date,
  ssn: string,
  address: string,
  city: string,
  state: string,
  zip: string,
  income?: number
): Promise<Customer> {
  let newCustomer = new Customer();
  newCustomer.firstName = firstName;
  newCustomer.lastName = lastName;
  newCustomer.username = username;
  newCustomer.password = password;
  newCustomer.email = email;
  newCustomer.phone = phone;
  newCustomer.dateOfBirth = dateOfBirth;
  newCustomer.ssn = ssn;
  newCustomer.address = address;
  newCustomer.city = city;
  newCustomer.state = state;
  newCustomer.zip = zip;
  if (income && income !== 0) {
    newCustomer.income = income;
  }

  newCustomer = await customerRepository.save(newCustomer);

  return newCustomer;
}

async function getCustomerByUserName(username: string): Promise<Customer | null> {
  const customer = await customerRepository
    .createQueryBuilder('customer')
    .where('username = :username', { username })
    .getOne();
  return customer;
}

async function getCustomerByUserNameAndEmail(
  username: string,
  email: string
): Promise<Customer | null> {
  const customer = await customerRepository
    .createQueryBuilder('customer')
    .where('username = :username OR email = :email', { username, email })
    .getOne();
  return customer;
}

async function getCustomerByEmail(email: string): Promise<Customer | null> {
  const customer = await customerRepository.findOne({ where: { email } });
  return customer || null;
}

async function getCustomerById(customerId: string): Promise<Customer | null> {
  const customer = await customerRepository.findOne({ where: { customerId } });
  return customer;
}

async function updateEmailAddressById(customerId: string, newEmail: string): Promise<void> {
  await customerRepository
    .createQueryBuilder()
    .update(Customer)
    .set({ email: newEmail })
    .where({ customerId })
    .execute();
}

async function getCustomerByAccountNumber(accountNumber: number): Promise<Customer | null> {
  const customer = await customerRepository
  .createQueryBuilder('customer')
  .leftJoinAndSelect('customer.accounts', 'accounts')
  .where({ accounts: { accountNumber }})
  .select(['customer', 'accounts.accountNumber'])
  .getOne();

  return customer;
}

// async function updateSecondEmailAddressById(
//   customerId: string,
//   newSecondEmail: string
// ): Promise<void> {
//   await customerRepository.createQueryBuilder
//     .update(Customer)
//     .set({ secondEmailAddress: newSecondEmail })
//     .where({ customerId })
//     .execute();
// }

async function updateAddressById(customerId: string, newAddress: string): Promise<void> {
  await customerRepository
    .createQueryBuilder()
    .update(Customer)
    .set({ address: newAddress })
    .where({ customerId })
    .execute();
}

async function updateCityById(customerId: string, newCity: string): Promise<void> {
  await customerRepository
    .createQueryBuilder()
    .update(Customer)
    .set({ city: newCity })
    .where({ customerId })
    .execute();
}

async function updateStateById(customerId: string, newState: string): Promise<void> {
  await customerRepository
    .createQueryBuilder()
    .update(Customer)
    .set({ state: newState })
    .where({ customerId })
    .execute();
}

async function updateZipById(customerId: string, newZip: string): Promise<void> {
  await customerRepository
    .createQueryBuilder()
    .update(Customer)
    .set({ zip: newZip })
    .where({ customerId })
    .execute();
}

async function updateIncomeById(customerId: string, newIncome: number): Promise<void> {
  await customerRepository
    .createQueryBuilder()
    .update(Customer)
    .set({ income: newIncome })
    .where({ customerId })
    .execute();
}

async function updateUsernameById(customerId: string, newUsername: string): Promise<void> {
  await customerRepository
    .createQueryBuilder()
    .update(Customer)
    .set({ username: newUsername })
    .where({ customerId })
    .execute();
}

async function updatePasswordById(customerId: string, newPassword: string): Promise<void> {
  await customerRepository
    .createQueryBuilder()
    .update(Customer)
    .set({ password: newPassword })
    .where({ customerId })
    .execute();
}

async function getRemindersDueInOneWeek(): Promise<Customer[]> {
  const today = new Date();
  const oneWeekFromToday = addWeeks(today, 2);

  const customers = await customerRepository
    .createQueryBuilder('customer')
    .leftJoinAndSelect('customer.reminders', 'reminders')
    .select(['customer.customerId', 'customer.email', 'customer.username', 'reminders'])
    .where('reminders.sendNotificationOn <= :oneWeekFromToday', { oneWeekFromToday })
    .andWhere('reminders.sendNotificationOn > :today', { today })
    .getMany();

  return customers;
}

export {
  addCustomer,
  getCustomerByUserName,
  getCustomerByEmail,
  getCustomerById,
  getCustomerByUserNameAndEmail,
  updateEmailAddressById,
  getCustomerByAccountNumber,
  // updateSecondEmailAddressById,
  updateAddressById,
  updateCityById,
  updateStateById,
  updateZipById,
  updateIncomeById,
  updateUsernameById,
  updatePasswordById,
  getRemindersDueInOneWeek,
};
