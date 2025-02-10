import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { UserBusiness } from '../entities/user-business.entity';
import { Permission } from './permission.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  mobile: string;

  @Column()
  adminId: number;

  @Column()
  role: string; // e.g., 'admin', 'employee'

  @OneToMany(() => UserBusiness, (userBusiness) => userBusiness.user)
  businesses: UserBusiness[];

  @OneToOne(() => Permission, (permission) => permission.user, { cascade: true })
  permission: Permission;
}
