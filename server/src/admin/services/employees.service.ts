// src/employees/employees.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBusiness } from '../entities/user-business.entity';
import { User } from '../entities/user.entity';
import { Business } from '../entities/business.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(UserBusiness)
    private userBusinessRepository: Repository<UserBusiness>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

  async findAllByBusiness(businessId: number) {
    return this.userBusinessRepository.find({
      where: { business: { id: businessId } },
      relations: ['user'],
    });
  }
  async associateUsersWithBusiness(businessId: number, userIds: number[]) {
    // Check if the business exists
    const business = await this.businessRepository.findOne({ where: { id: businessId } });
    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }

    // Check if all users exist
    const users = await this.userRepository.findByIds(userIds);
    if (users.length !== userIds.length) {
      throw new NotFoundException('One or more users not found');
    }

    // Create UserBusiness records for each user
    const userBusinessRecords = userIds.map((userId) => {
      const userBusiness = new UserBusiness();
      userBusiness.user = users.find((user) => user.id === userId);
      userBusiness.business = business;
      return userBusiness;
    });

    // Save all UserBusiness records
    return this.userBusinessRepository.save(userBusinessRecords);
  }
}
