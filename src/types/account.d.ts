type Account = {
  accountNumber: string;
  accountName: string;
  currentBalance: number;
  routingNumber: string;
  interest: number;
};

type AccountIdParam = {
  accountNumber: number;
};

export {Account, AccountIdParam};
