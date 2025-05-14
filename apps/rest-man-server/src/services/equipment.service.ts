import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like, Raw } from 'typeorm';
import { Equipment } from '../entities/equipment.entity';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
  ) {}

  async create(equipmentData: Partial<Equipment>): Promise<Equipment> {
    const equipment = this.equipmentRepository.create(equipmentData);
    return this.equipmentRepository.save(equipment);
  }

  async findAll(businessId: number): Promise<Equipment[]> {
    return this.equipmentRepository.find({
      where: { businessId },
      order: { createdAt: 'DESC' }
    });
  }

  async findById(id: number, businessId: number): Promise<Equipment> {
    return this.equipmentRepository.findOne({
      where: { id, businessId }
    });
  }

  async update(id: number, businessId: number, updateData: Partial<Equipment>): Promise<Equipment> {
    await this.equipmentRepository.update(
      { id, businessId },
      updateData
    );
    return this.findById(id, businessId);
  }

  async remove(id: number, businessId: number): Promise<void> {
    await this.equipmentRepository.delete({ id, businessId });
  }

  async search(businessId: number, query: string): Promise<Equipment[]> {
    // Using ILIKE for case-insensitive search across multiple columns
    return this.equipmentRepository.find({
      where: [
        { businessId, manufacturer: Raw(alias => `${alias} ILIKE '%${query}%'`) },
        { businessId, model: Raw(alias => `${alias} ILIKE '%${query}%'`) },
        { businessId, type: Raw(alias => `${alias} ILIKE '%${query}%'`) },
        { businessId, category: Raw(alias => `${alias} ILIKE '%${query}%'`) },
        { businessId, serialNumber: Raw(alias => `${alias} ILIKE '%${query}%'`) },
      ],
      order: { createdAt: 'DESC' }
    });
  }

  async searchByVector(businessId: number, searchTerm: string): Promise<Equipment[]> {
    // Using full-text search with tsvector for more advanced search capabilities
    const queryBuilder = this.equipmentRepository.createQueryBuilder('equipment');
    
    queryBuilder
      .where('equipment.businessId = :businessId', { businessId })
      .andWhere('equipment.searchvector @@ plainto_tsquery(:query)', { query: searchTerm })
      .orderBy('ts_rank(equipment.searchvector, plainto_tsquery(:query))', 'DESC');
    
    return queryBuilder.getMany();
  }

  async bulkCreate(equipments: Partial<Equipment>[]): Promise<Equipment[]> {
    const createdEquipments = this.equipmentRepository.create(equipments);
    return this.equipmentRepository.save(createdEquipments);
  }

  async findByCategory(businessId: number, category: string): Promise<Equipment[]> {
    return this.equipmentRepository.find({
      where: { businessId, category },
      order: { createdAt: 'DESC' }
    });
  }

  async findByStatus(businessId: number, status: string): Promise<Equipment[]> {
    return this.equipmentRepository.find({
      where: { businessId, status },
      order: { createdAt: 'DESC' }
    });
  }

  async findDueForMaintenance(businessId: number): Promise<Equipment[]> {
    const today = new Date();
    const queryBuilder = this.equipmentRepository.createQueryBuilder('equipment');
    
    return queryBuilder
      .where('equipment.businessId = :businessId', { businessId })
      .andWhere('equipment.lastMaintenanceDate + (equipment.maintenanceIntervalDays * INTERVAL \'1 day\') <= :today', { today })
      .getMany();
  }
} 