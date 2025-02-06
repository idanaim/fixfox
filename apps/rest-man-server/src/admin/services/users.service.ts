import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserBusiness } from '../entities/user-business.entity';
import { Business } from '../entities/business.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserBusiness)
    private userBusinessRepository: Repository<UserBusiness>,
  ) {}

  async create(user: Partial<User>): Promise<User> {
    return this.usersRepository.save(user);
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      // Include relationships if needed (e.g., businesses the user belongs to)
      relations: ['businesses'],
    });
  }
  async assignBusiness(userId: number, businessId: number): Promise<void> {
    const userBusiness = this.userBusinessRepository.create({
      user: { id: userId },
      business: { id: businessId },
    });
    await this.userBusinessRepository.save(userBusiness);
  }
}
