import { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCustomerById } from '../models/CustomerModel';
import {
  addTransaction,
  addInterest,
  getTransactionById,
  getTransactionsByCustomerId,
} from '../models/TransactionModel';
import {
  getAccountByAccountNumber,
  updateAccountByAccountNumber,
  AccountBelongsToCustomer,
} from '../models/AccountModel';
import { Transactions, TransactionIdParam } from '../types/transaction';
import { CustomerIdParam } from '../types/customerInfo';
import { parseDatabaseError } from '../utils/db-utils';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

async function getTransaction(req: Request, res: Response): Promise<void> {
  const { authenticatedCustomer, isLoggedIn } = req.session;
  const { transactionID } = req.params as TransactionIdParam;
  if (!isLoggedIn) {
    res.redirect('/login');
    return;
  }

  if (!authenticatedCustomer) {
    res.status(401).sendFile(path.join(__dirname, '../../public/html/accessDenied.html'));
    return;
  }

  const customer = await getCustomerById(req.session.authenticatedCustomer.customerId);
  if (!customer) {
    res.status(404).sendFile(path.join(__dirname, '../../public/html/userNotFound.html'));
    return;
  }

  try {
    const transaction = await getTransactionById(transactionID);

    if (!transaction) {
      throw new Error('No transaction');
    }
    res.render('transaction/transactionDetail', { customer, transaction });
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function getCustomerTransactions(req: Request, res: Response): Promise<void> {
  const { authenticatedCustomer, isLoggedIn } = req.session;
  if (!isLoggedIn) {
    res.redirect('/login');
    return;
  }
  if (!authenticatedCustomer) {
    res.status(401).sendFile(path.join(__dirname, '../../public/html/accessDenied.html'));
    return;
  }
  const { customerId } = authenticatedCustomer;
  const customer = await getCustomerById(authenticatedCustomer.customerId);
  if (!customer) {
    res.status(404).sendFile(path.join(__dirname, '../../public/html/userNotFound.html'));
    return;
  }

  const customerTransactions = await getTransactionsByCustomerId(customerId);
  try {
    console.log(customerTransactions);
    res.render('transaction_d', { customer, customerTransactions });
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
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
  res.render('/history', { record }); // replace with render once front-end is made.
}

async function makeTransaction(req: Request, res: Response): Promise<void> {
  const { authenticatedCustomer, isLoggedIn } = req.session;
  const { customerId, amount, type, accountNo, otherAccountNo } = req.body as Transactions;
  const date = new Date();
  let bankType = '';
  if (!isLoggedIn) {
    res.redirect('/login');
    return;
  }
  const customer = await getCustomerById(authenticatedCustomer.customerId);
  const account = await getAccountByAccountNumber(accountNo);
  const otherAccount = await getAccountByAccountNumber(otherAccountNo);
  const otherCustomer = await getCustomerById(customerId);
  const belongs = await AccountBelongsToCustomer(accountNo, authenticatedCustomer.customerId);
  const otherBelongs = await AccountBelongsToCustomer(otherAccountNo, customerId);
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
  if (!belongs) {
    res.sendStatus(404);
    return;
  }
  if (!otherBelongs) {
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
      res.status(403).sendFile(path.join(dirname, '../../public/html/transaction_failed.html'));
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
      res.status(403).sendFile(path.join(dirname, '../../public/html/transaction_failed.html'));
      return;
    }
    account.currentBalance -= amount;
    updateAccountByAccountNumber(accountNo, account);
    otherAccount.currentBalance += amount;
    otherType = 'Deposit';
    updateAccountByAccountNumber(accountNo, otherAccount);
  }
  try {
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
    console.log(transaction);
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
    res.status(201).sendFile(path.join(dirname, '../../public/html/transaction_successful.html'));
    console.log(otherTransaction);
    res.redirect('/transaction/add');
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function renderMakeTransactionPage(req: Request, res: Response): Promise<void> {
  const { authenticatedCustomer } = req.session;

  if (!authenticatedCustomer) {
    res.status(401).sendFile(path.join(dirname, '../../public/html/accessDenied.html'));
    return;
  }

  const { customerId } = authenticatedCustomer;

  const customer = await getCustomerById(customerId);

  if (!customer) {
    res.status(404).sendFile(path.join(dirname, '../../public/html/userNotFound.html'));
    return;
  }

  res.render('transaction/transaction_d', { customer });
}

async function accumulateInterest(req: Request, res: Response): Promise<void> {
  const { accountNo, customerId } = req.body as Transactions;
  const date = new Date();
  const account = await getAccountByAccountNumber(accountNo);
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
  if (account.interestType === 'Yearly') {
    if (
      date.getMonth() === 0 &&
      date.getDate() === 1 &&
      date.getHours() === 0 &&
      date.getMinutes() === 0 &&
      date.getSeconds() === 0
    ) {
      account.currentBalance += interestAmount;
    }
  } else if (account.interestType === 'Monthly') {
    if (
      date.getDate() === 1 &&
      date.getHours() === 0 &&
      date.getMinutes() === 0 &&
      date.getSeconds() === 0
    ) {
      account.currentBalance += interestAmount;
    }
  } else if (account.interestType === 'Weekly') {
    if (
      date.getDay() === 0 &&
      date.getHours() === 0 &&
      date.getMinutes() === 0 &&
      date.getSeconds() === 0
    ) {
      account.currentBalance += interestAmount;
    }
  } else if (account.interestType === 'Daily') {
    if (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0) {
      account.currentBalance += interestAmount;
    }
  } else {
    res.sendStatus(400); // interestType is specified to be something it isn't
  }
  const transaction = await addInterest(interestAmount, date, accountNo, customer);
  updateAccountByAccountNumber(accountNo, account);
  console.log(transaction);
}

export {
  getTransaction,
  makeTransaction,
  getCustomerTransactions,
  getMonthlyRecord,
  accumulateInterest,
  renderMakeTransactionPage,
};
