import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../entities/business.entity';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Business)
    private businessesRepository: Repository<Business>,
  ) {}

  async create(business: Partial<Business>): Promise<Business> {
    return this.businessesRepository.save(business);
  }

  async findAll(): Promise<Business[]> {
    return this.businessesRepository.find();
  }

  async update(id: number, business: Partial<Business>): Promise<Business> {
    await this.businessesRepository.update(id, business);
    return this.businessesRepository.findOneBy({ id} );
  }

  async findAllByAdmin(adminId: number): Promise<Business[]> {
    return this.businessesRepository.find({
      where: { admin: { id: adminId } },
      relations: ['employees', 'employees.user'],
    });
  }

  async delete(id: number): Promise<void> {
    await this.businessesRepository.delete(id);
  }
}
