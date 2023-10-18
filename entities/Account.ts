import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Relation } from 'typeorm';
import { Customer } from './Customer';

@Entity()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  accountNumber: string;

  @Column({ nullable: false })
  currentBalance: number;

  @Column({ unique: true })
  routingNumber: number;

  @ManyToOne(() => Customer, (customer) => customer.accounts, {
    cascade: ['insert', 'update'],
  })
  customer: Relation<Customer>;
}
