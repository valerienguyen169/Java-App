import './config'; // Load environment variables
import 'express-async-errors'; // Enable default error handling for async errors
import express, { Express } from 'express';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import { validateNewCustomerBody, validateLoginBody } from './validators/authValidator';
import { getAccount } from './controllers/AccountController';
import { getCustomerTransactions, makeTransaction } from './controllers/TransactionController';
import {
  registerUser,
  logIn,
  getCustomerDashboard,
  logOut,
  viewCustomerProfile,
} from './controllers/CustomerController';

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

app.get('/ping', (req, res) => {
  // Update the session timestamp to keep it alive
  req.session.touch();
  res.sendStatus(200); // Respond to the ping
});

// Account
app.get('/accounts/:accountNumber', getAccount);

// Transaction
app.post('/api/transactions', makeTransaction);
app.get('/transactions/:customerId', getCustomerTransactions);

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
