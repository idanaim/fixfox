// src/user-business/user-business.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBusiness } from '../entities/user-business.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class UserBusinessService {
  constructor(
    @InjectRepository(UserBusiness)
    private userBusinessRepository: Repository<UserBusiness>,
  ) {}

  async findUsersByAdmin(adminId: number): Promise<User[]> {
    const userBusinesses = await this.userBusinessRepository
      .createQueryBuilder('userBusiness')
      .leftJoinAndSelect('userBusiness.business', 'business')
      .leftJoinAndSelect('userBusiness.user', 'user')
      .where('business.adminId = :adminId', { adminId })
      .getMany();

    // Extract unique users
    return userBusinesses.map((ub) => ub.user).filter((user, index, self) =>
      self.findIndex((u) => u.id === user.id) === index
    );
  }
}
