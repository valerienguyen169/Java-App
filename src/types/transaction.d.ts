type Transactions = {
  transactionID: string;
  amount: number;
  date: Date;
  type?: string;
  accountNo: number,
  customerId: string,
};

type TransactionIdParam = {
  transactionID: string;
};
