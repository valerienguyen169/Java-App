type Transactions = {
  transactionID: string;
  amount: number;
  date: Date;
  type?: string;
  bankType?: string;
  accountNo: number;
  customerId: string;
  otherAccountNo: number;
};

type TransactionIdParam = {
  transactionID: string;
};

export { Transactions, TransactionIdParam };
