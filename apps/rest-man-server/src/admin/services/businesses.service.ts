import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../entities/business.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Business)
    private businessesRepository: Repository<Business>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(business: Partial<Business> & { adminId: number }): Promise<Business> {
    // Find the admin user
    const admin = await this.usersRepository.findOne({
      where: { id: business.adminId },
      relations: ['account']
    });
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${business.adminId} not found`);
    }

    // Create the business and associate it with the admin's account
    const newBusiness = this.businessesRepository.create({
      ...business,
      accountId: admin.accountId,
    });

    return this.businessesRepository.save(newBusiness);
  }

  async findAll(): Promise<Business[]> {
    return this.businessesRepository.find({
      relations: ['account', 'admin', 'user']
    });
  }

  async update(id: number, business: Partial<Business>): Promise<Business> {
    await this.businessesRepository.update(id, business);
    return this.businessesRepository.findOne({
      where: { id },
      relations: ['account', 'admin', 'employees', 'employees.user']
    });
  }

  async findAllByAccount(accountId: string): Promise<Business[]> {
    return this.businessesRepository.find({
      where: { accountId },
      relations: ['account', 'admin', 'employees', 'employees.user'],
    });
  }

  async delete(id: number): Promise<void> {
    await this.businessesRepository.delete(id);
  }
}
