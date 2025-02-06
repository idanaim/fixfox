import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { UserBusiness } from './user-business.entity';

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

  @ManyToOne(() => User, (user) => user.businesses)
  admin: User;

  @OneToMany(() => UserBusiness, (userBusiness) => userBusiness.business)
  employees: UserBusiness[];
}
