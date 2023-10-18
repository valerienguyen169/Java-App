import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { Customer } from './Customer';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  transactionId: string;

  @Column({ nullable: false })
  amount: number;

  @Column({ nullable: false })
  date: Date;

  @Column({ nullable: true })
  type: string;

  @ManyToOne(() => Customer, (customer) => customer.transactions, {
    cascade: ['insert', 'update'],
  })
  customer: Relation<Customer>;
}
