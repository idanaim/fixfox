import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChatSession } from './chat-session.entity';

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChatSession)
  @JoinColumn({ name: 'sessionId' })
  session: ChatSession;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // 'user', 'system', 'ai'

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any; // For storing additional data like suggested solutions, equipment matches, etc.
} 