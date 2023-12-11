import './config'; // Load environment variables
import 'express-async-errors'; // Enable default error handling for async errors
import express, { Express } from 'express';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import {
  validateNewCustomerBody,
  validateLoginBody,
  validatePasswordUpdateBody,
} from './validators/authValidator';
import {
  getAccount,
  getCustomerAccounts,
  addAccount,
  renderCreateAccountPage,
} from './controllers/AccountController';
import {
  getCustomerTransactions,
  getTransaction,
  makeTransaction,
  getMonthlyRecord,
  accumulateInterest,
  renderMakeTransactionPage,
} from './controllers/TransactionController';
import {
  registerUser,
  logIn,
  getCustomerDashboard,
  logOut,
  viewCustomerProfile,
  renderIncomePage,
  updateIncome,
  updateUsername,
  renderUsernamePage,
  updatePassword,
  renderPasswordPage,
  renderContactPage,
  updateContactInfo,
  renderContactUpdatePage,
  renderUserGuidePage,
} from './controllers/CustomerController';
import {
  addNewCreditCard,
  renderCreateCreditCardPage,
  getAllCreditCardByCustomer,
  getCreditCard,
  renderPaymentPage,
  makePayment,
} from './controllers/CreditCardController';

const app: Express = express();
app.set('view engine', 'ejs');

const { COOKIE_SECRET } = process.env;
let { PORT } = process.env;
PORT = process.argv[2] || PORT;

const SQLiteStore = connectSqlite3(session);
const store = new SQLiteStore({ db: 'sessions.sqlite' });
const inactivityTimeout = 5 * 60 * 1000;

app.use(express.static('public', { extensions: ['html'] }));

app.use(
  session({
    store,
    secret: COOKIE_SECRET as string,
    cookie: { maxAge: inactivityTimeout },
    name: 'session',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Customer
app.post('/register', validateNewCustomerBody, registerUser);
app.post('/login', validateLoginBody, logIn);
app.get('/dashboard', getCustomerDashboard);
app.get('/logout', logOut);
app.get('/profile', viewCustomerProfile);
app.get('/profile/income', renderIncomePage);
app.post('/profile/income', updateIncome);
app.get('/profile/username', renderUsernamePage);
app.post('/profile/username', updateUsername);
app.get('/profile/password', renderPasswordPage);
app.post('/profile/password', validatePasswordUpdateBody, updatePassword);
app.get('/profile/contact', renderContactPage);
app.post('/profile/contact/update', updateContactInfo);
app.get('/profile/contact/update', renderContactUpdatePage);

// User Guide
app.get('/userGuide', renderUserGuidePage);

// Credit Card
app.post('/creditCard/add', addNewCreditCard);
app.get('/creditCard/add', renderCreateCreditCardPage);
app.get('/creditCard', getAllCreditCardByCustomer);
app.get('/creditCard/:customerId/:accountNumber/details', getCreditCard);
app.get('/creditCard/:customerId/:accountNumber/payment', renderPaymentPage);
app.post('/creditCard/:customerId/:accountNumber/payment', makePayment);

app.get('/ping', (req, res) => {
  // Update the session timestamp to keep it alive
  req.session.touch();
  res.sendStatus(200); // Respond to the ping
});

// Account
app.post('/account/add', addAccount);
app.get('/account/add', renderCreateAccountPage);
app.get('/account/:accountNumber', getAccount);
app.get('/account/:customerId', getCustomerAccounts);

// Transaction
app.post('/transaction/add', makeTransaction);
app.get('/transaction/add', renderMakeTransactionPage);
app.get('/transaction', getCustomerTransactions);
app.get('/transaction/:customerId/:transactionId/details', getTransaction);
app.post('/api/transaction', accumulateInterest);
app.get('/history', getMonthlyRecord);

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
