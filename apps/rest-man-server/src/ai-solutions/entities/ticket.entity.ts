// ticket.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Issue } from './issue.entity';
import { User } from '../../admin/entities/user.entity';
import { Technician } from './technician.entity';

@Entity('ticket')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Issue)
  @JoinColumn({ name: 'issueId' })
  issue: Issue;

  @Column({ type: 'varchar', length: 50, default: 'open' })
  status: 'open' | 'in_progress' | 'closed';

  @ManyToOne(() => User)
  @JoinColumn({ name: 'openedBy' })
  openedBy: User;

  @ManyToOne(() => Technician, { nullable: true })
  @JoinColumn({ name: 'assignedTechnician' })
  assignedTechnician: Technician;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @CreateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
