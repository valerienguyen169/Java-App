/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-alert */
import { Request, Response } from 'express';
import argon2 from 'argon2';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  addCustomer,
  getCustomerByUserName,
  getCustomerByUserNameAndEmail,
  getCustomerById,
} from '../models/CustomerModel';
import { parseDatabaseError } from '../utils/db-utils';
import { AuthRequest, LoginAuthRequest } from '../types/customerInfo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    res.status(404).sendFile(path.join(__dirname, '../../public/html/userNotFound.html'));
    return;
  }

  const { password } = customer;

  if (!(await argon2.verify(password, passwordHash))) {
    res.status(404).sendFile(path.join(__dirname, '../../public/html/incorrectPassword.html'));
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

async function getCustomerDashboard(req: Request, res: Response): Promise<void> {
  if (!req.session.isLoggedIn) {
    res.redirect('/login');
    return;
  }

  const customer = await getCustomerById(req.session.authenticatedCustomer.customerId);
  console.log({ customer });
  res.render('dashboard', { customer });
}

async function logOut(req: Request, res: Response): Promise<void> {
  if (req.session) {
    req.session.isLoggedIn = false;
    req.session.save(() => {
      // Session is updated, and customer is marked as not logged in.
      res.redirect('/');
    });
  } else {
    // Handle the case where there is no active session.
    res.redirect('/');
  }
}

async function viewCustomerProfile(req: Request, res: Response): Promise<void> {
  const { authenticatedCustomer } = req.session;

  if (!authenticatedCustomer) {
    res.status(401).sendFile(path.join(__dirname, '../../public/html/accessDenied.html'));
    return;
  }

  const { customerId } = authenticatedCustomer;

  const customer = await getCustomerById(customerId);

  if (!customer) {
    res.status(404).sendFile(path.join(__dirname, '../../public/html/userNotFound.html'));
    return;
  }

  res.render('customer/profilePage', { customer });
}

export { registerUser, logIn, getCustomerDashboard, logOut, viewCustomerProfile };
