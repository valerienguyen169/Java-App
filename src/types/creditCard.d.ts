type CreditCard = {
  accountNumber: string;
  accountName: string;
  currentBalance: number;
  totalLimit: number;
  availableLimit: number;
  apr: number;
  statementBalance: number;
  minimumPaymentDue: number;
  paymentDueDate: Date;
  closingDate: Date;
};

type CreditCardIdParam = {
  accountNumber: string;
};
