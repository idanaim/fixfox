import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../admin/entities/user.entity';
import { Business } from '../../admin/entities/business.entity';
import { Issue } from './issue.entity';
import { ChatMessage } from './chat-message.entity';

@Entity()
export class ChatSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Business)
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', length: 50 })
  status: string; // 'active', 'resolved', 'pending_technician', 'assigned'

  @OneToMany(() => ChatMessage, (message) => message.session)
  messages: ChatMessage[];

  @ManyToOne(() => Issue, { nullable: true })
  @JoinColumn({ name: 'issueId' })
  issue: Issue;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any; // For storing session-specific data like current step, equipment context, etc.
}
