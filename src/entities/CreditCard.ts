import { Entity, PrimaryColumn, Column, ManyToOne, Relation } from 'typeorm';
import { Customer } from './Customer';

@Entity()
export class CreditCard {
  @PrimaryColumn()
  accountNumber: string;

  @Column({ nullable: false })
  accountName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  currentBalance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  totalLimit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  availableLimit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  apr: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  statementBalance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
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
