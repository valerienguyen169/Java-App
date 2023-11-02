import { Request, Response } from 'express';
import argon2 from 'argon2';
import { parseDatabaseError } from '../utils/db-utils';
import { getAccountsByCustomerId, getAccountByAccountNumber, updateAccountByAccountNumber, addAccount, AccountBelongsToCustomer } from "../models/AccountModel";
import { getTransactionById } from '../models/TransactionModel';
import { Account, AccountIdParam } from '../types/account';
import { Transaction } from '../types/transaction';
import { CustomerInfo } from '../types/customerInfo';

async function processTransaction(req: Request, res: Response): Promise<void> {
  const { accountNumber, accountName } = req.body as Account;
  const { customerId } = req.body as CustomerInfo;
  const { transactionID, amount, type } = req.body as Transaction;

  const transaction = await getTransactionById( transactionID );
  const belongs = await AccountBelongsToCustomer( accountNumber, customerId );
  const account = await getAccountByAccountNumber( accountNumber );

  if ( !account ){
    res.sendStatus(404); //Couldn't be found
    return;
  }

  if ( !belongs ){
    res.sendStatus(401); //Not allowed
    return;
  }

  if ( !transaction ){
    res.sendStatus(404); //Couldn't be found
    return;
  }

  if( accountName !== 'Savings' && accountName !== 'Checking' ){
    res.sendStatus(406); //not accepted
    return;
  }

  if( type !== 'Withdrawal' && type !== 'Deposit' ){
    res.sendStatus(406); //not accepted
    return;
  }

  if( type === 'Withdrawal' ){
    if( amount >= account.currentBalance ){
      res.sendStatus(403); // taking more than you have
      return;
    }
    account.currentBalance = account.currentBalance - amount;
    updateAccountByAccountNumber(accountNumber, account);
    res.sendStatus(200);
  }

  if ( type === 'Deposit' ){
    account.currentBalance = amount.currentBalance + amount;
    updateAccountByAccountNumber(accountNumber, account);
    res.sendStatus(200);
  }
}


export {processTransaction};
