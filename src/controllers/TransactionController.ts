import { Request, Response } from 'express';
import { getCustomerById } from '../models/CustomerModel';
import {
  addTransaction,
  addInterest,
  getTransactionById,
  getTransactionsByCustomerId,
  transactionBelongsToCustomer,
} from '../models/TransactionModel';
import { getAccountByAccountNumber, updateAccountByAccountNumber } from '../models/AccountModel';
import { Transactions, TransactionIdParam } from '../types/transaction';
import { CustomerIdParam, CustomerInfo } from '../types/customerInfo';

async function getTransaction(req: Request, res: Response): Promise<void> {
  const { transactionID } = req.params as TransactionIdParam;
  const { customerId } = req.body as CustomerInfo;
  const transaction = await getTransactionById(transactionID);

  if (!transaction) {
    res.sendStatus(404);
    return;
  }
  const belongs = transactionBelongsToCustomer(transactionID, customerId);
  if (!belongs) {
    res.sendStatus(403); // not your transaction. Turn into redirect later
  }

  res.sendStatus(200).json(transaction);
}

async function getCustomerTransactions(req: Request, res: Response): Promise<void> {
  const { customerId } = req.params as CustomerIdParam;
  const customer = await getCustomerById(customerId);
  if (!customer) {
    res.sendStatus(404); // Couldn't be found
    return;
  }
  const transactions = await getTransactionsByCustomerId(customerId);
  res.status(201).json(transactions); // replace with render once front-end file is created.
}

async function getMonthlyRecord(req: Request, res: Response): Promise<void> {
  const { customerId } = req.params as CustomerIdParam;
  const monthStart = new Date();
  if (monthStart.getDate() !== 1) {
    res.sendStatus(400); // can't do it yet
  }
  const lastMonth = new Date();
  const neededMonth = lastMonth.getMonth() - 1;
  lastMonth.setMonth(neededMonth);
  const customer = await getCustomerById(customerId);
  if (!customer) {
    res.sendStatus(404);
    return;
  }
  const record = [];
  const transactions = await getTransactionsByCustomerId(customerId);
  for (let i = 0; i < transactions.length; i += 1) {
    if (transactions[i].date >= lastMonth && transactions[i].date < monthStart) {
      record.push(transactions[i]);
    }
  }
  res.status(201).json(record); // replace with render once front-end is made.
}

async function makeTransaction(req: Request, res: Response): Promise<void> {
  const { authenticatedCustomer, isLoggedIn } = req.session;
  const { customerId, amount, date, type, accountNo, otherAccountNo } = req.body as Transactions;
  let bankType = '';
  if (!isLoggedIn) {
    res.redirect('/login');
    return;
  }
  const customer = await getCustomerById(authenticatedCustomer.customerId);
  const account = await getAccountByAccountNumber(accountNo);
  const otherAccount = await getAccountByAccountNumber(otherAccountNo);
  const otherCustomer = await getCustomerById(customerId);
  let otherType = '';
  if (!customer) {
    res.sendStatus(404);
    return;
  }
  if (!account) {
    res.sendStatus(404);
    return;
  }
  if (!otherAccount) {
    res.sendStatus(404);
    return;
  }
  if (!otherCustomer) {
    res.sendStatus(404);
    return;
  }
  if (accountNo === otherAccountNo) {
    res.sendStatus(400); // this would do nothing. Possibly a redirect as well
    return;
  }
  if (type !== 'Deposit' && type !== 'Withdrawal') {
    res.sendStatus(403); // no other possible transactions
    return;
  }
  if (type === 'Deposit') {
    if (amount >= otherAccount.currentBalance) {
      res.sendStatus(403); // can't have negative balance. Turn into redirect later
      return;
    }
    if (account.routingNumber === otherAccount.routingNumber) {
      bankType = 'InterBank';
    } else if (account.routingNumber !== otherAccount.routingNumber) {
      bankType = 'IntraBank';
    }
    account.currentBalance += amount;
    updateAccountByAccountNumber(accountNo, account);
    otherAccount.currentBalance -= amount;
    otherType = 'Withdrawal';
    updateAccountByAccountNumber(accountNo, otherAccount);
  }
  if (type === 'Withdrawal') {
    if (amount <= account.currentBalance) {
      res.sendStatus(403); // can't have negative balance. Turn into redirect later
      return;
    }
    account.currentBalance -= amount;
    updateAccountByAccountNumber(accountNo, account);
    otherAccount.currentBalance += amount;
    otherType = 'Deposit';
    updateAccountByAccountNumber(accountNo, otherAccount);
  }
  const transaction = await addTransaction(
    customerId,
    amount,
    date,
    type,
    bankType,
    accountNo,
    otherAccountNo,
    customer
  );
  const otherTransaction = await addTransaction(
    authenticatedCustomer.customerId,
    amount,
    date,
    otherType,
    bankType,
    otherAccountNo,
    accountNo,
    otherCustomer
  );
  console.log(transaction);
  console.log(otherTransaction);
}

async function accumulateInterest(req: Request, res: Response): Promise<void> {
  const { accountNumber, customerId } = req.body as Transactions;
  const date = new Date();
  const account = await getAccountByAccountNumber(accountNumber);
  const customer = await getCustomerById(customerId);
  if (!customer) {
    res.sendStatus(404);
    return;
  }
  if (!account) {
    res.sendStatus(404); // no account found.
    return;
  }
  if (account.accountName === 'Checking') {
    res.sendStatus(400); // Checking accounts can't accumulate interest.
  }
  const interestAmount = account.currentBalance * account.interest;
  account.currentBalance += interestAmount;
  account.currentBalance += interestAmount;
  const transaction = await addInterest(interestAmount, date, accountNumber, customer);
  updateAccountByAccountNumber(accountNumber, account);
  console.log(transaction);
}

export {
  getTransaction,
  makeTransaction,
  getCustomerTransactions,
  getMonthlyRecord,
  accumulateInterest,
};
