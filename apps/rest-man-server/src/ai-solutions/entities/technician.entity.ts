// technician.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../admin/entities/user.entity';
import { Business } from '../../admin/entities/business.entity';

@Entity('technician')
export class Technician {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Business)
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column('varchar', { array: true })
  expertise: string[];

  @Column({ type: 'varchar', length: 255 })
  serviceArea: string;

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  rating: number;

  @Column({ type: 'jsonb' })
  availability: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
  };

  @Column({ type: 'varchar', length: 50 })
  serviceType: 'onsite' | 'lab';

  @Column({ type: 'jsonb' })
  contactInfo: {
    mobile: string;
  };
}
