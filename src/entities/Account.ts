import { Entity, Column, PrimaryColumn, ManyToOne, Relation } from 'typeorm';
import { Customer } from './Customer';

@Entity()
export class Account {
  @PrimaryColumn()
  accountNumber: number;

  @Column({ nullable: false })
  accountName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  currentBalance: number;

  @Column({ unique: true })
  routingNumber: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  interest: number;

  @Column({ nullable: true })
  interestType: string;

  @ManyToOne(() => Customer, (customer) => customer.accounts, {
    cascade: ['insert', 'update'],
  })
  customer: Relation<Customer>;
}
