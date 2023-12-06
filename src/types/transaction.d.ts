type Transactions = {
  transactionID: string;
  amount: number;
  date: Date;
  type?: string;
  accountNo: number;
  customerId: string;
  otherAccountNo: number;
};

type TransactionIdParam = {
  transactionID: string;
};

export { Transactions, TransactionIdParam };
