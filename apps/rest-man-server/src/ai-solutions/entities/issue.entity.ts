// issue.entity.ts
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../admin/entities/user.entity';
import { Problem } from './problem.entity';
import { Equipment } from './equipment.entity';
import { Solution } from './solution.entity';
import { Business } from '../../admin/entities/business.entity';
import { ChatSession } from './chat-session.entity';

@Entity()
export class Issue {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'openedBy' })
  openedBy: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'solvedBy' })
  solvedBy: User;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @ManyToOne(() => Problem)
  @JoinColumn({ name: 'problemId' })
  problem: Problem;

  @ManyToOne(() => Equipment)
  @JoinColumn({ name: 'equipmentId' })
  equipment: Equipment;

  @ManyToOne(() => Solution)
  @JoinColumn({ name: 'solutionId' })
  solution: Solution;

  @ManyToOne(() => Business)
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column()
  status: string;
  //
  // @Column({ type: 'text', nullable: true })
  // symptoms: string;
  //
  // @Column({ type: 'text', nullable: true })
  // cause: string;
  //
  // @Column({ type: 'text', nullable: true })
  // treatment: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @OneToMany(() => ChatSession, session => session.issue)
  chatSessions: ChatSession[];

//   @Column({ type: 'jsonb', nullable: true })
//   aiAnalysis: any;
}
