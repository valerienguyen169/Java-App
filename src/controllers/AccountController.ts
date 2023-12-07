import { Request, Response } from 'express';
import {
  getAccountsByCustomerId,
  getAccountByAccountNumber,
  AccountBelongsToCustomer,
  createAccount,
} from '../models/AccountModel';
import { AccountIdParam } from '../types/account';
import { CustomerInfo, CustomerIdParam } from '../types/customerInfo';
import { getCustomerById } from '../models/CustomerModel';
import { Account } from '../entities/Account';
import { parseDatabaseError } from '../utils/db-utils';

async function addAccount(req: Request, res: Response): Promise<void> {
  const { authenticatedCustomer, isLoggedIn } = req.session;
  const account = req.body as Account;
  if (!isLoggedIn) {
    res.redirect('/login');
    return;
  }
  const customer = await getCustomerById(authenticatedCustomer.customerId);
  if (!customer) {
    res.sendStatus(404);
    return;
  }
  try {
    const newAccount = await createAccount(account, customer);
    console.log(newAccount);
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function getAccount(req: Request, res: Response): Promise<void> {
  const { accountNumber } = req.body as AccountIdParam;
  const { customerId } = req.body as CustomerInfo;

  const account = await getAccountByAccountNumber(accountNumber);
  if (!account) {
    res.sendStatus(404); // can be changed to redirect when html files are made.
    return;
  }

  const belongs = AccountBelongsToCustomer(accountNumber, customerId);

  if (!belongs) {
    res.sendStatus(401); // unauthorized. can be changed to redirect
    return;
  }

  res.sendStatus(200).json(account);
}

async function getCustomerAccounts(req: Request, res: Response): Promise<void> {
  const { customerId } = req.params as CustomerIdParam;
  const customer = await getCustomerById(customerId);

  if (!customer) {
    res.sendStatus(404); // couldn't be found. potentially redirect to itself in future.
    return;
  }
  const accounts = await getAccountsByCustomerId(customerId);
  res.status(201).json(accounts); // replace with render once front-end is created.
}

export { getAccount, getCustomerAccounts, addAccount };
