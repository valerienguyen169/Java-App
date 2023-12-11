import { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  addCreditCard,
  getCreditCardByAccountNumber,
  getCreditCardByCustomerId,
  updateCreditCardByAccountNumber,
} from '../models/CreditCardModel';
import { parseDatabaseError } from '../utils/db-utils';
import { CreditCard } from '../entities/CreditCard';
import { getCustomerById } from '../models/CustomerModel';
import { getAccountsByCustomerId } from '../models/AccountModel';
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

function calculateNewMinimumPaymentDue(newBalance: number): number {
  let minimumPaymentDue: number;

  if (newBalance <= 35) {
    minimumPaymentDue = newBalance;
  } else if (newBalance <= 500) {
    minimumPaymentDue = 35;
  } else if (newBalance > 500 && newBalance < 5000) {
    minimumPaymentDue = 500;
  } else {
    const percentage = 5;
    minimumPaymentDue = (percentage / 100) * newBalance;
  }

  return parseFloat(minimumPaymentDue.toFixed(2));
}

function addOneMonth(date: Date): Date {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + 1);
  return newDate;
}

async function updateCreditCard(creditCard: CreditCard, currentDate: Date): Promise<CreditCard> {
  if (currentDate > creditCard.closingDate) {
    const newClosingDate = addOneMonth(creditCard.closingDate);
    const newPaymentDueDate = addOneMonth(creditCard.paymentDueDate);
    const newMinimumPaymentDue = calculateNewMinimumPaymentDue(creditCard.currentBalance);
    const newStatementBalance = creditCard.currentBalance;

    await updateCreditCardByAccountNumber(creditCard.accountNumber, {
      closingDate: newClosingDate,
      paymentDueDate: newPaymentDueDate,
      minimumPaymentDue: newMinimumPaymentDue,
      statementBalance: newStatementBalance,
    });
  }
  return creditCard;
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

  const customer = await getCustomerById(req.session.authenticatedCustomer.customerId);
  if (!customer) {
    res.status(404).sendFile(path.join(__dirname, '../../public/html/userNotFound.html'));
    return;
  }

  const { accountNumber } = req.params;

  try {
    let creditCard = await getCreditCardByAccountNumber(accountNumber);

    if (!creditCard) {
      throw new Error('Credit card not found');
    }

    const currentDate = new Date();
    creditCard = await updateCreditCard(creditCard, currentDate);
    res.render('creditCard/creditCardDetail', { customer, creditCard });
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

async function makePayment(req: Request, res: Response): Promise<void> {
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

  const { accountNumber } = req.params;
  const { paymentAmount } = req.body;

  try {
    const creditCard = await getCreditCardByAccountNumber(accountNumber);

    if (!creditCard) {
      throw new Error('Credit card not found');
    }

    if (paymentAmount <= 0) {
      throw new Error('Invalid payment amount');
    }

    if (paymentAmount > creditCard.currentBalance) {
      throw new Error('Payment amount exceeds current balance');
    }

    const newBalance = creditCard.currentBalance - paymentAmount;
    const newAvailableLimit = creditCard.totalLimit - newBalance;
    const currentDate = new Date();
    let newStatementBalance = creditCard.statementBalance;
    if (currentDate > creditCard.closingDate && creditCard.currentBalance > 0) {
      newStatementBalance = creditCard.currentBalance;
    }
    const newMinimumPaymentDue =
      paymentAmount > creditCard.minimumPaymentDue
        ? 0
        : creditCard.minimumPaymentDue - paymentAmount;

    await updateCreditCardByAccountNumber(accountNumber, {
      currentBalance: newBalance,
      statementBalance: newStatementBalance,
      minimumPaymentDue: newMinimumPaymentDue,
      availableLimit: newAvailableLimit,
    });
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function renderPaymentPage(req: Request, res: Response): Promise<void> {
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

  const allAccounts = await getAccountsByCustomerId(customerId);
  const { accountNumber } = req.params;

  try {
    const creditCard = await getCreditCardByAccountNumber(accountNumber);
    console.log(creditCard);
    res.render('creditCard/paymentPage', { customer, creditCard, allAccounts });
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

export {
  addNewCreditCard,
  renderCreateCreditCardPage,
  getAllCreditCardByCustomer,
  getCreditCard,
  makePayment,
  renderPaymentPage,
};
