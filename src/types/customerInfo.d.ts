type CustomerInfo = {
  customerId: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  ssn: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  income?: number;
};

type CustomerIdParam = {
  customerId: string;
};

type AuthRequest = {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  ssn: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  income?: number;
};

type LoginAuthRequest = {
  username: string;
  passwordHash: string;
};

export { CustomerInfo, CustomerIdParam, AuthRequest, LoginAuthRequest };
