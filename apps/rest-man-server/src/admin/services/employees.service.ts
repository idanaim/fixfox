// src/employees/employees.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBusiness } from '../entities/user-business.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(UserBusiness)
    private userBusinessRepository: Repository<UserBusiness>,
  ) {}

  // async findAllByBusiness(businessId: number) {
  //   return this.userBusinessRepository.find({
  //     where: { business: { id: businessId } },
  //     relations: ['user'],
  //   });
  // }
}
