import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from './account.entity';
import { User } from './user.entity';

@Entity('account_admins')
export class AccountAdmin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid')
  accountId: string;

  @Column()
  userId: number;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
