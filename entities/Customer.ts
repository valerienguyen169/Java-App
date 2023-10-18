import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Relation } from 'typeorm';
import { Gender } from '../utils/enums';
import { Account } from './Account';
import { Transaction } from './Transaction';
import { CreditCard } from './CreditCard';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  customerID: string;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ unique: true, nullable: false })
  username: string;

  @Column({ nullable: false })
  passwordHash: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  phone: number;

  @Column({ nullable: false })
  dateOfBirth: Date;

  @Column({ unique: true, nullable: false })
  ssn: number;

  @Column({ nullable: true })
  gender: Gender;

  @Column({ nullable: false })
  address: string;

  @Column({ nullable: false })
  city: string;

  @Column({ nullable: false })
  state: string;

  @Column({ nullable: false })
  zip: number;

  @Column({ nullable: true })
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
