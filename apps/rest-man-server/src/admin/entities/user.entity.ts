import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { UserBusiness } from '../entities/user-business.entity';
import { Permissions } from './permissions.entity';
import { IsOptional } from 'class-validator';

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

@Column({ nullable: true })
@IsOptional()
  adminId: number;

  @Column()
  role: string; // e.g., 'admin', 'employee'

  @OneToMany(() => UserBusiness, (userBusiness) => userBusiness.user)
  businesses: UserBusiness[];

  @OneToOne(() => Permissions, (permissions) => permissions.user, {
    cascade: true, // Enable cascading for create and update
    eager: true,   // Automatically load permissions when fetching a user
  })
  permissions: Permissions;
}
