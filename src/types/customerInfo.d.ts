import { Gender } from '../utils/enums';

type CustomerInfo = {
  customerId: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  phone: number;
  dateOfBirth: Date;
  ssn: number;
  gender?: Gender;
  address: string;
  city: string;
  state: string;
  zip: number;
  income?: number;
};

type CustomerIdParam = {
  customerId: string;
};

type AuthRequest = {
  username: string;
  email: string;
  password: string;
};

type LoginAuthRequest = {
  email: string;
  password: string;
};

export { CustomerInfo, CustomerIdParam, AuthRequest, LoginAuthRequest };
