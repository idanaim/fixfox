import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from './account.entity';
import { UserBusiness } from './user-business.entity';
import { DepartmentType } from '../enums/department.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column('uuid')
  password: string;

  @Column()
  mobile: string;

  @Column({ nullable: true })
  adminId: number;

  @Column('uuid')
  accountId: string;

  @ManyToOne('Account', 'users')
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @OneToMany(() => UserBusiness, (userBusiness) => userBusiness.user)
  businesses: UserBusiness[];

  @Column({ type: 'varchar', length: 50, name: 'role' })
  role: string;

  @Column({
    type: 'enum',
    enum: DepartmentType,
    nullable: true,
  })
  department: DepartmentType;

  @Column('simple-array', { nullable: true })
  departments: string[];

  @Column({ nullable: true })
  positionTitle: string;
}
