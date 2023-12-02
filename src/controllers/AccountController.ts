import { Request, Response } from 'express';
import argon2 from 'argon2';
import { parseDatabaseError } from '../utils/db-utils';
import { getAccountsByCustomerId, getAccountByAccountNumber, AccountBelongsToCustomer } from "../models/AccountModel";
import { Account, AccountIdParam } from '../types/account';
import { CustomerInfo, CustomerIdParam } from '../types/customerInfo';
import { getCustomerById } from '../models/CustomerModel';

async function getAccount(req: Request, res: Response): Promise<void> {
  const {accountNumber} = req.params as AccountIdParam;
  const {customerId} = req.body as CustomerInfo;

  const account = await getAccountByAccountNumber(accountNumber);
  if(!account){
    res.sendStatus(404); // can be changed to redirect when html files are made.
    return;
  }

  const belongs = AccountBelongsToCustomer(accountNumber, customerId);

  if(!belongs){
    res.sendStatus(401); //unauthorized. can be changed to redirect
    return;
  }

  res.sendStatus(200).json(account);
}

async function getCustomerAccounts(req: Request, res: Response): Promise<void> {
  const {customerId} = req.params as CustomerIdParam;
  const customer = await getCustomerById(customerId);

  if(!customer){
    res.sendStatus(404); // couldn't be found. potentially redirect to itself in future.
    return;
  }
  const accounts = await getAccountsByCustomerId(customerId);
  res.status(201).json(accounts); // replace with render once front-end is created.
}

export {getAccount, getCustomerAccounts};
