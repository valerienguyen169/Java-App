import { Request, Response } from 'express';
import argon2 from 'argon2';
import { parseDatabaseError } from '../utils/db-utils';
import { getCustomerById } from '../models/CustomerModel';
import { addTransaction,
  getTransactionById,
  getTransactionByCustomerId,
  updateTransactionById,
  transactionBelongsToCustomer } from '../models/TransactionModel';
import { Transaction, TransactionIdParam } from '../types/transaction';
import { Account, AccountIdParam } from '../types/account';

async function getTransaction(req: Request, res: Response): Promise<void> {
  const {transactionID} = req.params as TransactionIdParam;

  const transaction = await getTransactionById(transactionID);

  if(!transaction){
    res.sendStatus(404);
    return;
  }

  res.sendStatus.json(transaction);
}

async function makeTransaction(req: Request, res: Response): Promise<void> {
  const {authenticatedCustomer, isLoggedIn} = req.session;
  const {amount, date, type} = req.body as Transaction;
  if (!isLoggedIn){
    res.redirect('/login');
    return;
  }
  const customer = await getCustomerById(authenticatedCustomer.customerId);

  if (!customer){
    res.sendStatus(404);
    return;
  }
  const transaction = await addTransaction(amount, date, type, customer);
  transaction.customer = undefined;
}

//async function interBankTransfer (req: Request, res: Response): Promise<void> {
//  const {transactionID} = req.params as TransactionIdParam;
//  const {customerId} = req.body as CustomerInfo;
//  const {accountNumber} = req.query as AccountIdParam;
//  const {routingNumber} = req.body as Account;
//  const {amount, type} = req.body as Transaction;
//
//  const transaction = await getTransactionById(transactionID);
//  const accountList = await getAccountsByCustomerId(customerId);
//  const otherAccount = await getAccountByAccountNumber(accountNumber);
//  let account: Account;
//
//  if(routingNumber === account.routingNumber){
//    res.sendStatus(400); // this is an intrabank transfer. Maybe this could be made a redirect?
//    return;
//  }
//
//  if(accountNumber === otherAccount?.accountNumber){
//    res.sendStatus(400); // this would do nothing. Possibly a redirect as well
//    return;
//  }
//
//  if ( !account ){
//    res.sendStatus(404); //Couldn't be found
//    return;
//  }
//
//  if ( !transaction ){
//    res.sendStatus(404); //Couldn't be found
//    return;
//  }
//
//  if( type !== 'WIthdrawal' && transaction.type !== 'Deposit' ){
//    res.sendStatus(403); //not allowed
//    return;
//  }
//
//  if( type === 'Withdrawal' ){
//    if( amount >= account.currentBalance ){
//      res.sendStatus(403); // taking more than you have
//      return;
//    }
//    account.currentBalance = account.currentBalance - amount;
//    updateAccountByAccountNumber(accountNumber, account);
//    res.sendStatus(200);
//  }
//
//  if ( type === 'Deposit' ){
//    account.currentBalance = amount.currentBalance + amount;
//    updateAccountByAccountNumber(accountNumber, account);
//    res.sendStatus(200);
//  }
//}


export {getTransaction, makeTransaction}
