import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Relation } from 'typeorm';
import { Customer } from './Customer';

@Entity()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  accountNumber: number;

  @Column({ nullable: false })
  accountName: string;

  @Column({ nullable: false })
  currentBalance: number;

  @Column({ unique: true })
  routingNumber: number;

  @Column({ nullable: true })
  interest: number;

  @ManyToOne(() => Customer, (customer) => customer.accounts, {
    cascade: ['insert', 'update'],
  })
  customer: Relation<Customer>;
}
