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
    private usersRepository: Repository<User>
  ) {}

  async create(
    business: Partial<Business> & { accountId: string }
  ): Promise<Business> {
    // Create the business and associate it with the account
    const newBusiness = this.businessesRepository.create({
      ...business,
      accountId: business.accountId,
    });

    return this.businessesRepository.save(newBusiness);
  }

  async findAll(): Promise<Business[]> {
    try {
      console.log('🔍 BusinessesService.findAll() called');
      console.log('📊 Repository:', this.businessesRepository);
      
      const businesses = await this.businessesRepository.find();
      console.log('✅ Database query successful, found businesses:', businesses?.length || 0);
      console.log('📋 Businesses data:', businesses);
      
      return businesses;
    } catch (error) {
      console.error('❌ Error in BusinessesService.findAll():', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async update(id: number, business: Partial<Business>): Promise<Business> {
    await this.businessesRepository.update(id, business);
    return this.businessesRepository.findOne({
      where: { id },
      relations: ['account', 'admin', 'employees', 'employees.user'],
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
