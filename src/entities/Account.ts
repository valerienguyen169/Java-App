import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Relation } from 'typeorm';

import { Customer } from './Customer';

@Entity
export class Account {
  @PrimaryGeneratedColumn('uuid')
  accountNumber: number;

  @Column()
  currentBalance: number;

  @Column()
  routingNumber: number;

  @ManyToOne(() => Customer, (customer) => customer.accounts)
  customer: Relation<Customer>;
}
