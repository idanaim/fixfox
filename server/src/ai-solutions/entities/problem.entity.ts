import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { Equipment } from '../../entities/equipment.entity';
import { User } from '../../admin/entities/user.entity';
import { Solution } from './solution.entity';
import { Symptom } from './symptom.entity';

@Entity('problem')
export class Problem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Equipment, (equipment) => equipment.problems)
  @JoinColumn({ name: 'equipmentId' })
  equipment: Equipment;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'reportedBy' })
  reportedBy: User;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @OneToMany(() => Solution, (solution) => solution.problem)
  solutions: Solution[];

  @ManyToMany(() => Symptom, (symptom) => symptom.problems)
  symptoms: Symptom[];
}
