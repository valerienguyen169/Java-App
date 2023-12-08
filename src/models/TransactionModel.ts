import { AppDataSource } from '../dataSource';
import { Transaction } from '../entities/Transaction';
import { Customer } from '../entities/Customer';

const transactionRepository = AppDataSource.getRepository(Transaction);

// async function addTransaction(
//   customerId: string,
//   amount: number,
//   date: Date,
//   type: string,
//   bankType: string,
//   accountNo: number,
//   otherAccountNo: number,
//   customer: Customer
// ): Promise<Transaction[]> {
//   let newTransaction = new Transaction();
//   newTransaction.customerId = customerId;
//   newTransaction.amount = amount;
//   newTransaction.date = date;
//   if (type !== undefined) {
//     newTransaction.type = type;
//   }
//   if (bankType !== undefined) {
//     newTransaction.bankType = bankType;
//   }
//   newTransaction.accountNo = accountNo;
//   newTransaction.otherAccountNo = otherAccountNo;
//   newTransaction.customer = customer;
//   newTransaction.customer.transactions.push(newTransaction);
//   newTransaction = await transactionRepository.save(newTransaction);

//   return newTransaction.customer.transactions;
// }

// Tran added
async function addTransaction(transaction: Transaction, customer: Customer): Promise<Transaction> {
  let newTransaction = new Transaction();
  newTransaction.transactionId = transaction.transactionId;
  newTransaction.amount = transaction.amount;
  newTransaction.date = transaction.date;
  newTransaction.type = transaction.type;
  newTransaction.bankType = transaction.bankType;
  newTransaction.accountNo = transaction.accountNo;
  newTransaction.customerId = transaction.customerId;
  newTransaction.otherAccountNo = transaction.otherAccountNo;

  newTransaction.customer = customer;

  newTransaction = await transactionRepository.save(newTransaction);

  return newTransaction;
}

async function addInterest(
  amount: number,
  date: Date,
  accountNo: number,
  customer: Customer
): Promise<Transaction> {
  let newTransaction = new Transaction();
  newTransaction.amount = amount;
  newTransaction.date = date;
  newTransaction.accountNo = accountNo;
  newTransaction.customer = customer;

  newTransaction = await transactionRepository.save(newTransaction);

  return newTransaction;
}

async function getTransactionById(transactionId: string): Promise<Transaction | null> {
  const transaction = await transactionRepository
    .createQueryBuilder('transaction')
    .where('transaction.transactionId = :id', { id: transactionId })
    .leftJoin('transaction.customer', 'customer')
    .select([
      'transaction.transactionId',
      'transaction.customerId',
      'transaction.amount',
      'transaction.date',
      'transaction.type',
      'transaction.accountNo',
      'transaction.otherAccountNo',
      'customer.customerId',
    ])
    .getOne();
  return transaction;
}

async function getTransactionsByCustomerId(customerId: string): Promise<Transaction[]> {
  const transactions = await transactionRepository
    .createQueryBuilder('transaction')
    .leftJoinAndSelect('transaction.customer', 'customer')
    .where({ customer: { customerId } })
    .select(['transaction', 'customer.customerId'])
    .getMany();

  return transactions;
}

async function updateTransactionById(
  transactionId: string,
  newTransaction: Partial<Transaction>
): Promise<void> {
  await transactionRepository
    .createQueryBuilder()
    .update(Transaction)
    .set(newTransaction)
    .where({ transactionId })
    .execute();
}

async function transactionBelongsToCustomer(
  transactionId: string,
  customerId: string
): Promise<boolean> {
  const transactionExists = await transactionRepository
    .createQueryBuilder('transaction')
    .leftJoinAndSelect('transaction.customer', 'customer')
    .where('transaction.transactionId = :transactionId', { transactionId })
    .andWhere('customer.customerId = :customerId', { customerId })
    .getExists();

  return transactionExists;
}

export {
  addTransaction,
  addInterest,
  getTransactionById,
  getTransactionsByCustomerId,
  updateTransactionById,
  transactionBelongsToCustomer,
};
