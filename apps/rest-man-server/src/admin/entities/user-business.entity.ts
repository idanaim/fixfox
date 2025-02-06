import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../entities/user.entity';
import { Business } from '../entities/business.entity';

@Entity()
export class UserBusiness {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.businesses)
  user: User;

  @ManyToOne(() => Business, (business) => business.employees)
  business: Business;
}
