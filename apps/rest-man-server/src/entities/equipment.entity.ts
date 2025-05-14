import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';

@Entity('equipment')
export class Equipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index('IDX_equipment_business')
  businessId: number;

  @Column()
  type: string;

  @Column()
  manufacturer: string;

  @Column()
  model: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'date', nullable: true })
  purchaseDate: Date;

  @Column({ nullable: true })
  supplier: string;

  @Column({ type: 'date', nullable: true })
  warrantyExpiration: Date;

  @Column({ nullable: true, length: 512 })
  photoUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'tsvector', nullable: true })
  searchvector: any;

  @Column({ nullable: true, length: 100 })
  serialNumber: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'int', nullable: true })
  expectedLifespan: number;

  @Column({ type: 'date', nullable: true })
  lastMaintenanceDate: Date;

  @Column({ type: 'int', nullable: true })
  maintenanceIntervalDays: number;

  @Column({ default: 'operational' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  maintenanceHistory: any;

  @Column({ type: 'jsonb', nullable: true })
  aiMetadata: any;

  @Column({ type: 'jsonb', nullable: true })
  specifications: any;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  purchasePrice: number;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[];
} 