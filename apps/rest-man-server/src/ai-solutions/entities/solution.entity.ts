import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Problem } from './problem.entity';

@Entity('solution')
export class Solution {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Problem, (problem) => problem.solutions)
  @JoinColumn({ name: 'problemId' })
  problem: Problem;

  @Column({ type: 'text', nullable: true })
  cause: string;

  @Column({ type: 'text' })
  treatment: string;

  @Column({ name: 'resolvedBy', type: 'varchar', length: 255 })
  resolvedBy: string; // 'AI' or technician ID

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ type: 'int', default: 0 })
  effectiveness: number;

  @Column({ name: 'isExternal', type: 'boolean', default: false })
  isExternal: boolean;

  @Column({ type: 'varchar', length: 255 })
  source: string; // Format: 'business:<id>' or 'technician:<id>'

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
