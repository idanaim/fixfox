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
import { Problem } from '../ai-solutions/entities/problem.entity';
import { Business } from '../admin/entities/business.entity';
import { EquipmentStatus } from '../ai-solutions/enums/equipment-status.enum';

@Entity('equipment')
export class Equipment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Business, (business) => business.id)
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column()
  @Index('IDX_equipment_business')
  businessId: number;

  @Column({ type: 'varchar', length: 255 })
  type: string;

  @Column({ type: 'varchar', length: 255 })
  manufacturer: string;

  @Column({ type: 'varchar', length: 255 })
  model: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'date', nullable: true })
  purchaseDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  supplier: string;

  @Column({ type: 'date', nullable: true })
  warrantyExpiration: Date;

  @Column({ type: 'varchar', length: 512, nullable: true })
  photoUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'tsvector', nullable: true })
  searchvector: any;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serialNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  category: string;

  @Column({ type: 'int', nullable: true })
  expectedLifespan: number;

  @Column({ type: 'date', nullable: true })
  lastMaintenanceDate: Date;

  @Column({ type: 'int', nullable: true })
  maintenanceIntervalDays: number;

  @Column({
    type: 'enum',
    enum: EquipmentStatus,
    default: EquipmentStatus.OPERATIONAL
  })
  status: EquipmentStatus;

  @Column({ type: 'jsonb', nullable: true })
  maintenanceHistory: {
    date: Date;
    type: 'repair' | 'maintenance' | 'inspection';
    description: string;
    cost?: number;
    technician?: string;
    notes?: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  aiMetadata: {
    commonIssues?: string[];
    recommendedMaintenance?: string[];
    performanceMetrics?: Record<string, any>;
    lastAnalysis?: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  specifications: {
    dimensions?: {
      width?: number;
      height?: number;
      depth?: number;
      unit: 'cm' | 'inch';
    };
    weight?: {
      value: number;
      unit: 'kg' | 'lbs';
    };
    powerRequirements?: {
      voltage: number;
      amperage?: number;
      phase?: string;
    };
    operatingConditions?: {
      temperature?: { min: number; max: number; unit: 'C' | 'F' };
      humidity?: { min: number; max: number; unit: '%' };
    };
    customSpecs?: Record<string, any>;
  };

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  purchasePrice: number;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[];

  @OneToMany(() => Problem, (problem) => problem.equipment)
  problems: Problem[];
} 