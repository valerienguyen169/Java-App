import { Entity, PrimaryColumn, Column, ManyToOne, Relation } from 'typeorm';
import { Customer } from './Customer';

@Entity()
export class Transaction {
  @PrimaryColumn()
  transactionId: string;

  @Column({ nullable: false })
  customerId: string;

  @Column({ nullable: false })
  amount: number;

  @Column({ nullable: false })
  date: Date;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  bankType: string;

  @Column({ nullable: false })
  accountNo: number;

  @Column({ nullable: true })
  otherAccountNo: number;

  @ManyToOne(() => Customer, (customer) => customer.transactions, {
    cascade: ['insert', 'update'],
  })
  customer: Relation<Customer>;
}
