import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Technician } from './technician.entity';

@Entity('rating')
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  rating_id: string;

  @ManyToOne(() => Technician, technician => technician.ratings)
  @JoinColumn({ name: 'technician_id' })
  technician: Technician;

  @Column('int')
  response_time: number;

  @Column('int')
  price: number;

  @Column('int')
  quality_accuracy: number;

  @Column('int')
  professionalism: number;

  @Column('int')
  efficiency: number;

  @Column('int')
  aesthetics: number;

  @Column({ type: 'text', nullable: true })
  review_comment: string;

  @CreateDateColumn()
  rated_at: Date;
} 