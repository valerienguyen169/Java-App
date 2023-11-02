import { AppDataSource } from '../dataSource';
import { Transaction } from '../entities/Transaction';
import { Customer } from '../entities/Customer';

const transactionRepository = AppDataSource.getRepository(Transaction);

async function addTransaction(amount: number, date: Date, type: string, customer: Customer): Promise<Transaction> {
  let newTransaction = new Transaction();
  newTransaction.amount = amount;
  newTransaction.date = date;
  if (type !== undefined) {
    newTransaction.type = type;
  }
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
      'transaction.amount',
      'transaction.date',
      'transaction.type',
      'customer.customerId',
    ])
    .getOne();
  return transaction;
}

async function getTransactionByCustomerId(customerId: string): Promise<Transaction[]> {
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
  getTransactionById,
  getTransactionByCustomerId,
  updateTransactionById,
  transactionBelongsToCustomer,
};
