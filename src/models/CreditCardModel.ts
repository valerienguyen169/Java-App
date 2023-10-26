import { AppDataSource } from '../dataSource';
import { CreditCard } from '../entities/CreditCard';
import { Customer } from '../entities/Customer';

const creditCardRepository = AppDataSource.getRepository(CreditCard);

async function addCreditCard(creditCard: CreditCard, customer: Customer): Promise<CreditCard> {
  let newCreditCard = new CreditCard();
  newCreditCard.accountNumber = creditCard.accountNumber;
  newCreditCard.accountName = creditCard.accountName;
  newCreditCard.currentBalance = creditCard.currentBalance;
  newCreditCard.totalLimit = creditCard.totalLimit;
  newCreditCard.availableLimit = creditCard.availableLimit;
  newCreditCard.apr = creditCard.apr;
  newCreditCard.statementBalance = creditCard.statementBalance;
  newCreditCard.minimumPaymentDue = creditCard.minimumPaymentDue;
  newCreditCard.paymentDueDate = creditCard.paymentDueDate;
  newCreditCard.closingDate = creditCard.closingDate;

  newCreditCard.customer = customer;

  newCreditCard = await creditCardRepository.save(newCreditCard);

  return newCreditCard;
}

async function getCreditCardByAccountNumber(accountNumber: string): Promise<CreditCard | null> {
  const creditCard = await creditCardRepository
    .createQueryBuilder('creditCard')
    .where('creditCard.accountNumber = :accountNumber', { accountNumber })
    .leftJoin('creditCard.customer', 'customer')
    .select([
      'creditCard.accountNumber',
      'creditCard.accountName',
      'creditCard.currentBalance',
      'creditCard.totalLimit',
      'creditCard.availableLimit',
      'creditCard.apr',
      'creditCard.statementBalance',
      'creditCard.minimumPaymentDue',
      'creditCard.paymentDueDate',
      'creditCard.closingDate',
      'customer.customerId',
    ])
    .getOne();
  return creditCard;
}

async function getCreditCardByCustomerId(customerId: string): Promise<CreditCard[]> {
  const creditCards = await creditCardRepository
    .createQueryBuilder('creditCard')
    .leftJoinAndSelect('creditCard.customer', 'customer')
    .where({ customer: { customerId } })
    .select(['creditCard', 'customer.customerId'])
    .getMany();

  return creditCards;
}

async function updateCreditCardByAccountNumber(
  accountNumber: string,
  newCreditCard: Partial<CreditCard>
): Promise<void> {
  await creditCardRepository
    .createQueryBuilder()
    .update(CreditCard)
    .set(newCreditCard)
    .where({ accountNumber })
    .execute();
}

async function creditCardBelongsToCustomer(
  accountNumber: string,
  customerId: string
): Promise<boolean> {
  const creditCardExists = await creditCardRepository
    .createQueryBuilder('creditCard')
    .leftJoinAndSelect('creditCard.customer', 'customer')
    .where('creditCard.accountNumber = :accountNumber', { accountNumber })
    .andWhere('customer.customerId = :customerId', { customerId })
    .getExists();

  return creditCardExists;
}

export {
  addCreditCard,
  getCreditCardByAccountNumber,
  getCreditCardByCustomerId,
  updateCreditCardByAccountNumber,
  creditCardBelongsToCustomer,
};
