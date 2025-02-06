import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from 'typeorm';
import { UserBusiness } from '../entities/user-business.entity';

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
  role: string; // e.g., 'admin', 'employee'

  @OneToMany(() => UserBusiness, (userBusiness) => userBusiness.user)
  businesses: UserBusiness[];
}
