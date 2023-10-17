import { Entity, Column, PrimaryColumn, OneToMany, Relation } from 'typeorm';
import { Account } from './Account';

@Entity()
export class Customer {
  @PrimaryColumn()
  customerID: string;

  @Column({ unique: true })
  password: string;

  @Column({ unique: true })
  email: string;

  @Column()
  Income: number;

  @Column()
  zip: number;

  @Column()
  phone: number;

  @Column()
  city: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  state: string;

  @Column({ unique: true })
  ssn: number;

  @Column()
  dateOfBirth: Date;

  @Column()
  address: string;

  @Column({ unique: true })
  username: string;

  @OneToMany(() => Account, (accounts) => accounts.user)
  accounts: Relation<Account>[];
}
