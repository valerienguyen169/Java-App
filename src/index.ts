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
import { getAccount, getCustomerAccounts } from './controllers/AccountController';
import {
  getCustomerTransactions,
  makeTransaction,
  accumulateInterest,
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
} from './controllers/CustomerController';
import {
  addNewCreditCard,
  renderCreateCreditCardPage,
  getAllCreditCardByCustomer,
  getCreditCard,
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

// Credit Card
app.post('/creditCard/add', addNewCreditCard);
app.get('/creditCard/add', renderCreateCreditCardPage);
app.get('/creditCard', getAllCreditCardByCustomer);
app.get('/creditCard/details/:customerId/:accountNumber', getCreditCard);

app.get('/ping', (req, res) => {
  // Update the session timestamp to keep it alive
  req.session.touch();
  res.sendStatus(200); // Respond to the ping
});

// Account
app.get('/accounts/:accountNumber', getAccount);
app.get('/accounts/:customerId', getCustomerAccounts);

// Transaction
app.post('/api/transactions', makeTransaction);
app.get('/transactions/:customerId', getCustomerTransactions);
app.post('/api/transactions', accumulateInterest);

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
