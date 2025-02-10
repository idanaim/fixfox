// src/entities/permission.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  createTicket: boolean;

  @Column({ default: false })
  readTicket: boolean;

  @Column({ default: false })
  updateTicket: boolean;

  @Column({ default: false })
  deleteTicket: boolean;

  @Column({ default: false })
  manageUsers: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.permission, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
