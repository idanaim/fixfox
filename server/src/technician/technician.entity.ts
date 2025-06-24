// dtos.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Location } from './location.entity';
import { Rating } from './rating.entity';

export enum ServiceType {
  ON_SITE = 'onSite',
  LAB = 'lab',
}

export enum Profession {
  ELECTRICIAN = 'electrician',
  PLUMBER = 'plumber',
  REFRIGERATION_SPECIALIST = 'refrigeration_specialist',
  HVAC_TECHNICIAN = 'hvac_technician',
  APPLIANCE_TECHNICIAN = 'appliance_technician',
  GAS_TECHNICIAN = 'gas_technician',
  HANDYMAN = 'handyman',
  IT_POS_TECHNICIAN = 'it_pos_technician',
  FIRE_SAFETY_TECHNICIAN = 'fire_safety_technician',
  PEST_CONTROL_SPECIALIST = 'pest_control_specialist',
  DISHWASHER_TECHNICIAN = 'dishwasher_technician',
  LAUNDRY_EQUIPMENT_TECHNICIAN = 'laundry_equipment_technician',
  FLOOR_EQUIPMENT_SPECIALIST = 'floor_equipment_specialist',
  BUILDING_MAINTENANCE_TECHNICIAN = 'building_maintenance_technician',
  KITCHEN_EXHAUST_SPECIALIST = 'kitchen_exhaust_specialist',
  OTHER = 'other',
}

@Entity('technician')
export class Technician {
  @PrimaryGeneratedColumn('uuid')
  technician_id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ServiceType,
    default: ServiceType.ON_SITE,
  })
  service_type: ServiceType;

  @Column({ nullable: true })
  image: string;

  @Column()
  mobile: string;

  @Column()
  address: string;

  @ManyToMany(() => Location)
  @JoinTable({
    name: 'technician_location',
    joinColumn: {
      name: 'technician_id',
      referencedColumnName: 'technician_id',
    },
    inverseJoinColumn: {
      name: 'location_id',
      referencedColumnName: 'location_id',
    },
  })
  locations: Location[];

  @Column({
    type: 'enum',
    enum: Profession,
    array: true,
  })
  professions: Profession[];

  @OneToMany(() => Rating, (rating) => rating.technician)
  ratings: Rating[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
