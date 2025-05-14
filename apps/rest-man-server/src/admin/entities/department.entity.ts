import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum DepartmentType {
  KITCHEN = 'kitchen',
  FLOOR = 'floor',
  BAR = 'bar',
  MANAGEMENT = 'management',
  MAINTENANCE = 'maintenance'
}

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: DepartmentType,
    default: DepartmentType.KITCHEN
  })
  department: DepartmentType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 