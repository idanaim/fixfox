import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { UserBusiness } from './user-business.entity';
import { Account } from './account.entity';

@Entity()
export class Business {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  mobile: string;

  @Column()
  type: string;

  @Column()
  address: string;

  @Column({ type: 'integer', nullable: true })
  defaultTechnicianId: number;

  @Column('uuid')
  accountId: string;

  @ManyToOne(() => Account, (account) => account.businesses)
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @ManyToOne(() => User, (user) => user.businesses)
  admin: User;

  @OneToMany(() => UserBusiness, (userBusiness) => userBusiness.business)
  employees: UserBusiness[];
}
