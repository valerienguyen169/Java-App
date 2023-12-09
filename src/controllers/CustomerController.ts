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
  updateIncomeById,
  updateUsernameById,
  updatePasswordById,
  updateEmailAddressById,
  updatePhoneById,
  updateAddressById,
  updateCityById,
  updateStateById,
  updateZipById,
} from '../models/CustomerModel';
import { parseDatabaseError } from '../utils/db-utils';
import { AuthRequest, LoginAuthRequest } from '../types/customerInfo';
import { getAccountsByCustomerId } from '../models/AccountModel';
import { getCreditCardByCustomerId } from '../models/CreditCardModel';

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
  const { authenticatedCustomer } = req.session;
  if (!authenticatedCustomer) {
    res.status(401).sendFile(path.join(__dirname, '../../public/html/accessDenied.html'));
    return;
  }

  const customer = await getCustomerById(req.session.authenticatedCustomer.customerId);
  if (!customer) {
    res.status(404).sendFile(path.join(__dirname, '../../public/html/userNotFound.html'));
    return;
  }

  const { customerId } = authenticatedCustomer;
  const allAccounts = await getAccountsByCustomerId(customerId);
  const allCreditCards = await getCreditCardByCustomerId(customerId);
  console.log({ customer });
  res.render('dashboard', { customer, allAccounts, allCreditCards });
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

async function updateIncome(req: Request, res: Response): Promise<void> {
  const { authenticatedCustomer } = req.session;

  if (!authenticatedCustomer) {
    res.status(401).sendFile(path.join(__dirname, '../../public/html/accessDenied.html'));
    return;
  }

  const { customerId } = authenticatedCustomer;
  const { income } = req.body as { income: number };

  const customer = await getCustomerById(customerId);

  if (!customer) {
    res.status(404).sendFile(path.join(__dirname, '../../public/html/userNotFound.html'));
    return;
  }

  // Now update their place using try/catch block
  try {
    await updateIncomeById(customerId, income);
  } catch (err) {
    // There could be invalid input
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
    return;
  }
  res.redirect(`/profile`);
}

async function renderIncomePage(req: Request, res: Response): Promise<void> {
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

  res.render('customer/updateIncome', { customer });
}

async function updateUsername(req: Request, res: Response): Promise<void> {
  const { authenticatedCustomer } = req.session;

  if (!authenticatedCustomer) {
    res.status(401).sendFile(path.join(__dirname, '../../public/html/accessDenied.html'));
    return;
  }

  const { customerId } = authenticatedCustomer;
  const { username } = req.body as { username: string };

  const customer = await getCustomerById(customerId);

  if (!customer) {
    res.status(404).sendFile(path.join(__dirname, '../../public/html/userNotFound.html'));
    return;
  }

  // Now update their place using try/catch block
  try {
    await updateUsernameById(customerId, username);
  } catch (err) {
    // There could be invalid input
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
    return;
  }
  res.redirect(`/profile`);
}

async function renderUsernamePage(req: Request, res: Response): Promise<void> {
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

  res.render('customer/updateUsername', { customer });
}

async function renderPasswordPage(req: Request, res: Response): Promise<void> {
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

  res.render('customer/updatePassword', { customer });
}

async function updatePassword(req: Request, res: Response): Promise<void> {
  const { authenticatedCustomer } = req.session;

  if (!authenticatedCustomer) {
    res.status(401).sendFile(path.join(__dirname, '../../public/html/accessDenied.html'));
    return;
  }

  const { customerId } = authenticatedCustomer;
  const { currentPassword, newPassword, confirmNewPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  };

  // Fetch the customer's information from the database
  const customer = await getCustomerById(customerId);

  if (!customer) {
    res.status(404).sendFile(path.join(__dirname, '../../public/html/userNotFound.html'));
    return;
  }

  // Verify that the current password matches the one stored in the database
  if (!(await argon2.verify(customer.password, currentPassword))) {
    res.status(401).json({ error: 'Current password is incorrect' });
    return;
  }

  // Verify that the new password and confirmation match
  if (newPassword !== confirmNewPassword) {
    res.status(400).json({ error: 'New password and confirmation do not match' });
    return;
  }

  // Hash and update the new password
  const newPasswordHash = await argon2.hash(newPassword);

  try {
    await updatePasswordById(customerId, newPasswordHash); // Implement this function in your database logic
  } catch (err) {
    // Handle any database errors
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
    return;
  }

  res.redirect(`/profile`);
}

async function renderContactPage(req: Request, res: Response): Promise<void> {
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

  res.render('customer/contactPage', { customer });
}

async function renderContactUpdatePage(req: Request, res: Response): Promise<void> {
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

  res.render('customer/updateContactPage', { customer });
}

async function updateContactInfo(req: Request, res: Response): Promise<void> {
  const { authenticatedCustomer } = req.session;

  if (!authenticatedCustomer) {
    res.status(401).sendFile(path.join(__dirname, '../../public/html/accessDenied.html'));
    return;
  }

  const { customerId } = authenticatedCustomer;
  const { email, phone, address, city, state, zip } = req.body as {
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };

  const customer = await getCustomerById(customerId);

  if (!customer) {
    res.status(404).sendFile(path.join(__dirname, '../../public/html/userNotFound.html'));
    return;
  }

  // Now update their place using try/catch block
  try {
    await updateEmailAddressById(customerId, email);
    await updatePhoneById(customerId, phone);
    await updateAddressById(customerId, address);
    await updateCityById(customerId, city);
    await updateStateById(customerId, state);
    await updateZipById(customerId, zip);
  } catch (err) {
    // There could be invalid input
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
    return;
  }
  res.redirect(`/profile`);
}

async function renderUserGuidePage(req: Request, res: Response): Promise<void> {
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

  res.render('userGuide', { customer });
}

export {
  registerUser,
  logIn,
  getCustomerDashboard,
  logOut,
  viewCustomerProfile,
  updateIncome,
  renderIncomePage,
  updateUsername,
  renderUsernamePage,
  updatePassword,
  renderPasswordPage,
  renderContactPage,
  renderContactUpdatePage,
  updateContactInfo,
  renderUserGuidePage,
};
