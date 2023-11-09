type Transaction = {
  transactionID: string;
  amount: number;
  date: Date;
  type?: string;
  accountNo: number,
};

type TransactionIdParam = {
  transactionID: string;
};
