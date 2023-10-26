import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Relation } from 'typeorm';
import { Account } from './Account';
import { Transaction } from './Transaction';
import { CreditCard } from './CreditCard';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  customerId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true, nullable: false })
  username: string;

  @Column({ nullable: false })
  password: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  phone: string;

  @Column({ nullable: false })
  dateOfBirth: Date;

  @Column({ unique: true, nullable: false })
  ssn: string;

  @Column({ nullable: false })
  address: string;

  @Column({ nullable: false })
  city: string;

  @Column({ nullable: false })
  state: string;

  @Column({ nullable: false })
  zip: string;

  @Column({ nullable: true, default: 0 })
  income: number;

  @OneToMany(() => Account, (accounts) => accounts.customer, {
    cascade: ['insert', 'update'],
  })
  accounts: Relation<Account>[];

  @OneToMany(() => Transaction, (transactions) => transactions.customer, {
    cascade: ['insert', 'update'],
  })
  transactions: Relation<Transaction>[];

  @OneToMany(() => CreditCard, (creditCards) => creditCards.customer, {
    cascade: ['insert', 'update'],
  })
  creditCards: Relation<CreditCard>[];
}
