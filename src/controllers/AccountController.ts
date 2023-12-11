import { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
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

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

async function addAccount(req: Request, res: Response): Promise<void> {
  const { authenticatedCustomer, isLoggedIn } = req.session;
  const account = req.body as Account;
  if (!isLoggedIn) {
    res.redirect('/login'); // gotta get logged in first;
    return;
  }
  const customer = await getCustomerById(authenticatedCustomer.customerId);
  if (!customer) {
    res.status(404).sendFile(path.join(dirname, '../../public/html/userNotFound.html'));
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

async function renderCreateAccountPage(req: Request, res: Response): Promise<void> {
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

  res.render('account/createAccount', { customer });
}

export { getAccount, getCustomerAccounts, addAccount, renderCreateAccountPage };
