import { Request, Response } from 'express';
import argon2 from 'argon2';
import { parseDatabaseError } from '../utils/db-utils';
import { getAccountsByCustomerId, getAccountByAccountNumber, updateAccountByAccountNumber, addAccount, AccountBelongsToCustomer } from "../models/AccountModel";
import { Account, AccountIdParam } from '../types/account';

async function getAccount(req: Request, res: Response): Promise<void> {
  const {accountNumber} = req.params as AccountIdParam;

  const account = await getAccountByAccountNumber(accountNumber);
  if(!account){
    res.sendStatus(404);
    return;
  }

  res.sendStatus(200).json(account);
}

export {getAccount};
