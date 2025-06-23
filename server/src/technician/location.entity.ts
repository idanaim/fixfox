import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Technician } from './technician.entity';

@Entity('location')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  location_id: string;

  @Column()
  city: string;

  @Column()
  area: string;

  @ManyToMany(() => Technician, (technician) => technician.locations)
  technicians: Technician[];
}
