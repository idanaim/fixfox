import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Business } from './business.entity';
import { User } from './user.entity';

@Entity('account')
export class Account {
    @PrimaryGeneratedColumn('uuid')
    accountId: string;

    @Column()
    name: string;

    @OneToMany(() => Business, business => business.account)
    businesses: Business[];

    @OneToMany(() => User, user => user.account)
    users: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 