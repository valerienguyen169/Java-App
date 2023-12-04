import { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  addCreditCard,
  getCreditCardByAccountNumber,
  getCreditCardByCustomerId,
} from '../models/CreditCardModel';
import { parseDatabaseError } from '../utils/db-utils';
import { CreditCard } from '../entities/CreditCard';
import { getCustomerById } from '../models/CustomerModel';
// import { CustomerIdParam } from '../types/customerInfo';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

async function addNewCreditCard(req: Request, res: Response): Promise<void> {
  const { authenticatedCustomer, isLoggedIn } = req.session;
  if (!isLoggedIn) {
    res.redirect('/login');
    return;
  }
  const customer = await getCustomerById(authenticatedCustomer.customerId);
  if (!customer) {
    res.sendStatus(404);
    return;
  }

  const creditCard = req.body as CreditCard;
  try {
    const newCreditCard = await addCreditCard(creditCard, customer);
    console.log(newCreditCard);
    res.redirect('/creditCard/add');
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function getCreditCard(req: Request, res: Response): Promise<void> {
  if (!req.session.isLoggedIn) {
    res.redirect('/login');
    return;
  }
  const { authenticatedCustomer } = req.session;
  if (!authenticatedCustomer) {
    res.status(401).sendFile(path.join(__dirname, '../../public/html/accessDenied.html'));
    return;
  }

  // const { customerId } = authenticatedCustomer;
  const customer = await getCustomerById(req.session.authenticatedCustomer.customerId);
  if (!customer) {
    res.status(404).sendFile(path.join(__dirname, '../../public/html/userNotFound.html'));
    return;
  }

  const { accountNumber } = req.params;

  try {
    const creditCard = await getCreditCardByAccountNumber(accountNumber);
    console.log(creditCard);
    res.render('creditCard/creditCardDetail', { customer, creditCard });
    // res.json(creditCard);
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function renderCreateCreditCardPage(req: Request, res: Response): Promise<void> {
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

  res.render('creditCard/createCreditCard', { customer });
}

async function getAllCreditCardByCustomer(req: Request, res: Response): Promise<void> {
  if (!req.session.isLoggedIn) {
    res.redirect('/login');
    return;
  }
  const { authenticatedCustomer } = req.session;
  if (!authenticatedCustomer) {
    res.status(401).sendFile(path.join(__dirname, '../../public/html/accessDenied.html'));
    return;
  }

  const { customerId } = authenticatedCustomer;
  const customer = await getCustomerById(req.session.authenticatedCustomer.customerId);
  if (!customer) {
    res.status(404).sendFile(path.join(__dirname, '../../public/html/userNotFound.html'));
    return;
  }

  const allCreditCards = await getCreditCardByCustomerId(customerId);
  try {
    console.log(allCreditCards);
    res.render('creditCard/creditCardPage', { customer, allCreditCards });
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

export { addNewCreditCard, renderCreateCreditCardPage, getAllCreditCardByCustomer, getCreditCard };
