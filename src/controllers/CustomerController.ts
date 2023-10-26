import { Request, Response } from 'express';
import argon2 from 'argon2';
import {
  addCustomer,
  getCustomerByUserName,
  getCustomerByUserNameAndEmail,
} from '../models/CustomerModel';
import { parseDatabaseError } from '../utils/db-utils';
import { AuthRequest, LoginAuthRequest } from '../types/customerInfo';

async function registerUser(req: Request, res: Response): Promise<void> {
  const {
    firstName,
    lastName,
    username,
    password,
    email,
    phone,
    dateOfBirth,
    ssn,
    address,
    city,
    state,
    zip,
    income,
  } = req.body as AuthRequest;

  const customer = await getCustomerByUserNameAndEmail(username, email);
  if (customer) {
    res.send('Username or email already exists!');
    return;
  }

  const passwordHash = await argon2.hash(password);

  try {
    const newCustomer = await addCustomer(
      firstName,
      lastName,
      username,
      passwordHash,
      email,
      phone,
      dateOfBirth,
      ssn,
      address,
      city,
      state,
      zip,
      income
    );
    console.log(newCustomer);
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function logIn(req: Request, res: Response): Promise<void> {
  const { username, passwordHash } = req.body as LoginAuthRequest;

  const customer = await getCustomerByUserName(username);

  if (!customer) {
    res.redirect('/login');
    return;
  }

  const { password } = customer;

  if (!(await argon2.verify(passwordHash, password))) {
    res.redirect('/login');
    return;
  }

  await req.session.clearSession();

  req.session.authenticatedCustomer = {
    customerId: customer.customerId,
    username: customer.username,
  };
  req.session.isLoggedIn = true;

  res.redirect('/dashboard');
}

export { registerUser, logIn };
