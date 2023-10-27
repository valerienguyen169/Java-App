import { AppDataSource } from '../dataSource';
import { Account } from '../entities/Account';
import { Customer } from '../entities/Customer';

const AccountRepository = AppDataSource.getRepository(Account);

async function addAccount(account: Account, customer: Customer): Promise<Account> {
  let newAccount = new Account();
  newAccount.accountNumber = account.accountNumber;
  newAccount.accountName = account.accountName;
  newAccount.currentBalance = account.currentBalance;
  newAccount.routingNumber = account.routingNumber;
  newAccount.interest = account.interest;

  newAccount.customer = customer;

  newAccount = await AccountRepository.save(newAccount);

  return newAccount;
}

async function getAccountByAccountNumber(accountNumber: string): Promise<Account | null> {
  const account = await AccountRepository
  .createQueryBuilder('account')
  .where('account.accountNumber = :accountNumber', { accountNumber })
  .leftJoin('account.customer', 'customer')
  .select([
    'account.accountNumber',
    'account.accountName',
    'account.currentBalance',
    'account.routingNumber',
    'account.interest',
    'customer.customerId',
  ])
  .getOne();
  return account;
}

async function getAccountByCustomerId(customerId: string): Promise<Account[]> {
  const accounts = await AccountRepository
  .createQueryBuilder('account')
  .leftJoinAndSelect('account.customer', 'customer')
  .where({ customer: { customerId }})
  .select(['account', 'customer.customerId'])
  .getMany();

  return accounts;
}

async function AccountBelongsToCustomer(accountNumber: string, customerId: string): Promise <boolean> {
  const accountExists = await AccountRepository
  .createQueryBuilder('account')
  .leftJoinAndSelect('account.customer', 'customer')
  .where('account.accountNumber = :accountNumber', { accountNumber })
  .andWhere('customer.customerId = :customerId', { customerId })
  .getExists();

  return accountExists;
}

async function updateAccountByAccountNumber( accountNumber: string, newAccount: Partial<Account>): Promise<void> {
  await AccountRepository
  .createQueryBuilder()
  .update(Account)
  .set(newAccount)
  .where({ accountNumber })
  .execute();
}


export {
  AccountBelongsToCustomer,
  addAccount,
  getAccountByAccountNumber,
  getAccountByCustomerId,
  updateAccountByAccountNumber,
}
