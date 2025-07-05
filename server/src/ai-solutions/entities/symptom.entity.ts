import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Problem } from './problem.entity';

@Entity('symptoms')
export class Symptom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', {
    unique: true,
    comment: 'A unique, raw symptom description (e.g., "making a loud rattling noise").',
  })
  description: string;

  @Column({
    name: 'equipment_type',
    length: 255,
    comment: 'The general type of equipment (e.g., "Air Conditioner").',
  })
  equipmentType: string;

  @Column({
    name: 'equipment_model',
    length: 255,
    nullable: true,
    comment: 'The specific model of the equipment, if known.',
  })
  equipmentModel: string;

  @ManyToMany(() => Problem, (problem) => problem.symptoms)
  @JoinTable({
    name: 'symptom_problems',
    joinColumn: { name: 'symptom_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'problem_id', referencedColumnName: 'id' },
  })
  problems: Problem[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
} 