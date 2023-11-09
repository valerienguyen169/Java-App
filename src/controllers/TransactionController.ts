import { Request, Response } from 'express';
import argon2 from 'argon2';
import { parseDatabaseError } from '../utils/db-utils';
import { getCustomerById, getCustomerByAccountNumber } from '../models/CustomerModel';
import { addTransaction,
  getTransactionById,
  getTransactionsByCustomerId,
  updateTransactionById,
  transactionBelongsToCustomer } from '../models/TransactionModel';
import { getAccountByAccountNumber, updateAccountByAccountNumber } from '../models/AccountModel';
import { Transaction, TransactionIdParam } from '../types/transaction';
import { AccountIdParam } from '../types/account';
import { CustomerIdParam } from '../types/customerInfo';

async function getTransaction(req: Request, res: Response): Promise<void> {
  const {transactionID} = req.params as TransactionIdParam;

  const transaction = await getTransactionById(transactionID);

  if(!transaction){
    res.sendStatus(404);
    return;
  }

  res.sendStatus(200).json(transaction);
}

async function getCustomerTransactions(req: Request, res: Response): Promise<void> {
  const {customerId} = req.params as CustomerIdParam;
  const customer = await getCustomerById(customerId);
  if (!customer){
    res.sendStatus(404); // Couldn't be found
    return;
  }
  const transactions = await getTransactionsByCustomerId(customerId);
  res.status(201).json(transactions); // replace with render once front-end file is created.

}

async function makeTransaction(req: Request, res: Response): Promise<void> {
  const {authenticatedCustomer, isLoggedIn} = req.session;
  const {amount, date, type, accountNo} = req.body as Transaction;
  const {accountNumber} = req.params as AccountIdParam;
  if (!isLoggedIn){
    res.redirect('/login');
    return;
  }
  const customer = await getCustomerById(authenticatedCustomer.customerId);
  const account = await getAccountByAccountNumber(accountNumber);
  const otherCustomer = await getCustomerByAccountNumber(accountNo);
  const otherAccount = await getAccountByAccountNumber(accountNo);
  let otherType = '';
  if (!customer){
    res.sendStatus(404);
    return;
  }
  if (!account){
    res.sendStatus(404);
    return;
  }
  if (!otherCustomer){
    res.sendStatus(404);
    return;
  }
  if (!otherAccount){
    res.sendStatus(404);
    return;
  }
  if(accountNumber === accountNo){
    res.sendStatus(400); // this would do nothing. Possibly a redirect as well
    return;
  }
  if( type !== 'Deposit' && type !== 'Withdrawal'){
    res.sendStatus(403); //no other possible transactions
    return;
  }
  if( type === 'Deposit'){
    account.currentBalance = account.currentBalance + amount;
    updateAccountByAccountNumber(accountNumber, account);
    otherAccount.currentBalance = otherAccount.currentBalance - amount;
    otherType = 'Withdrawal';
    updateAccountByAccountNumber(accountNo, otherAccount);
  }
  if( type === 'Withdrawal'){
    account.currentBalance = account.currentBalance - amount;
    updateAccountByAccountNumber(accountNumber, account);
    otherAccount.currentBalance = otherAccount.currentBalance + amount;
    otherType = 'Deposit';
    updateAccountByAccountNumber(accountNo, otherAccount);
  }
  const transaction = await addTransaction(amount, date, type, accountNumber, customer);
  const otherTransaction = await addTransaction(amount, date, otherType, accountNo, otherCustomer);
  transaction.customer = undefined;
  otherTransaction.customer = undefined;
}


export {getTransaction, makeTransaction, getCustomerTransactions}
