import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../admin/entities/user.entity';
import { Issue } from '../../ai-solutions/entities/issue.entity';
import { Business } from '../../admin/entities/business.entity';

export enum NotificationType {
  ISSUE_ASSIGNED = 'issue_assigned',
  ISSUE_STATUS_CHANGED = 'issue_status_changed',
  ISSUE_COMMENT = 'issue_comment',
  ISSUE_ESCALATED = 'issue_escalated',
  ISSUE_RESOLVED = 'issue_resolved',
  ISSUE_OVERDUE = 'issue_overdue',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export enum NotificationChannel {
  PUSH = 'push',
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in_app',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Business)
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @ManyToOne(() => Issue, { nullable: true })
  @JoinColumn({ name: 'issueId' })
  issue: Issue;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    array: true,
    default: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
  })
  channels: NotificationChannel[];

  @Column({ type: 'jsonb', nullable: true })
  data: {
    issueId?: number;
    routeTo?: string;
    routeParams?: any;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    actionRequired?: boolean;
    expiresAt?: string;
  };

  @Column({ nullable: true })
  pushToken: string;

  @Column({ nullable: true })
  sentAt: Date;

  @Column({ nullable: true })
  deliveredAt: Date;

  @Column({ nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 