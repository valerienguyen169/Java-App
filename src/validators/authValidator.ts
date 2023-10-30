import Joi from 'joi';
import { makeValidator } from '../utils/makeValidator';

const newCustomerSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  username: Joi.string().max(25).required(),
  password: Joi.string().min(8).max(25).required(),
  email: Joi.string().email().lowercase().required(),
  phone: Joi.string().required(),
  dateOfBirth: Joi.date().required(),
  ssn: Joi.string().required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zip: Joi.string().required(),
  income: Joi.number().optional(),
});

const validateNewCustomerBody = makeValidator(newCustomerSchema, 'body');

const loginSchema = Joi.object({
  username: Joi.string().required(),
  passwordHash: Joi.string().required(),
});
const validateLoginBody = makeValidator(loginSchema, 'body');

export { validateNewCustomerBody, validateLoginBody };
