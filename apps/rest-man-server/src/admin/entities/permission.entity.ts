import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string; // e.g., "create", "edit", "delete"

  // @ManyToMany(() => User, (user) => user.permissions)
  // users: User[];
}
