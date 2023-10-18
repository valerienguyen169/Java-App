import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';
import { Customer } from './Customer';

@Entity()
export class CreditCard {
  @PrimaryGeneratedColumn('uuid')
  accountNumber: string;

  @Column({ nullable: false })
  accountName: string;

  @Column({ nullable: false })
  currentBalance: number;

  @Column({ nullable: false })
  totalLimit: number;

  @Column({ nullable: false })
  availableLimit: number;

  @Column({ nullable: false })
  apr: number;

  @Column({ nullable: false })
  statementBalance: number;

  @Column({ nullable: false })
  minimumPaymentDue: number;

  @Column({ nullable: false })
  paymentDueDate: Date;

  @Column({ nullable: false })
  closingDate: Date;

  @ManyToOne(() => Customer, (customer) => customer.creditCards, {
    cascade: ['insert', 'update'],
  })
  customer: Relation<Customer>;
}
