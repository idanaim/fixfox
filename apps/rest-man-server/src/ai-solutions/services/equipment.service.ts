import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from '../entities/equipment.entity';
import { Business } from '../../admin/entities/business.entity';
import {
  CreateEquipmentDto,
  SimilarEquipmentDto,
  UpdateEquipmentDto,
} from '../dtos/create-equipment.dto';
import { AIService } from './ai.service';

// import { User } from '../user/user.entity';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    private aiService: AIService
  ) {}

  async createEquipment(
    createEquipmentDto: CreateEquipmentDto
  ): Promise<Equipment> {
    const business = await this.businessRepository.findOneBy({
      id: createEquipmentDto.businessId,
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const equipment = this.equipmentRepository.create({
      ...createEquipmentDto,
      business,
    });

    return this.equipmentRepository.save(equipment)[0];
  }

  async getEquipmentByBusiness(businessId: number): Promise<Equipment[]> {
    return this.equipmentRepository.find({
      where: { business: { id: businessId } },
      relations: ['problems', 'business'],
      order: { createdAt: 'DESC' },
    });
  }

  async identifyEquipment(
    userDescription: string,
    businessId: number
  ): Promise<Equipment[]> {
    // First try to find exact matches
    const exactMatches = await this.equipmentRepository
      .createQueryBuilder('equipment')
      .where('equipment.businessId = :businessId', { businessId })
      .andWhere(
        `equipment.searchVector @@ plainto_tsquery('english', :query)`,
        {
          query: userDescription,
        }
      )
      .limit(5)
      .getMany();

    if (exactMatches.length > 0) return exactMatches;

    // If no exact matches, use AI to suggest type
    const suggestedType = await this.aiService.identifyEquipmentType(
      userDescription
    );

    return this.equipmentRepository
      .createQueryBuilder('equipment')
      .where('equipment.businessId = :businessId', { businessId })
      .andWhere('equipment.type ILIKE :type', { type: `%${suggestedType}%` })
      .limit(5)
      .getMany();
  }

  async updateEquipment(
    id: number,
    updateDto: UpdateEquipmentDto
  ): Promise<Equipment> {
    const equipment = await this.equipmentRepository.preload({
      id,
      ...updateDto,
    });

    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    return this.equipmentRepository.save(equipment);
  }

  async deleteEquipment(id: number): Promise<void> {
    const result = await this.equipmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }
  }

  async findSimilarEquipment(
    similarEquipmentDto: SimilarEquipmentDto
  ): Promise<Equipment[]> {
    return this.equipmentRepository
      .createQueryBuilder('equipment')
      .where('equipment.businessId = :businessId', {
        businessId: similarEquipmentDto.businessId,
      })
      .andWhere('similarity(equipment.model, :model) > 0.3', {
        model: similarEquipmentDto.model,
      })
      .andWhere('equipment.manufacturer = :manufacturer', {
        manufacturer: similarEquipmentDto.manufacturer,
      })
      .orderBy('similarity(equipment.model, :model)', 'DESC')
      .setParameters({ model: similarEquipmentDto.model })
      .limit(5)
      .getMany();
  }

  async addEquipmentPhoto(id: number, photoUrl: string): Promise<Equipment> {
    const equipment = await this.equipmentRepository.findOneBy({ id });
    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    equipment.photoUrl = photoUrl;
    return this.equipmentRepository.save(equipment);
  }

  async getEquipmentMaintenanceHistory(id: number): Promise<Equipment> {
    return this.equipmentRepository.findOne({
      where: { id },
      relations: ['problems', 'problems.solutions'],
    });
  }

  async searchEquipment(
    query: string,
    businessId: number
  ): Promise<Equipment[]> {
    return this.equipmentRepository
      .createQueryBuilder('equipment')
      .where('equipment.businessId = :businessId', { businessId })
      .andWhere(
        `equipment.searchVector @@ plainto_tsquery('english', :query)`,
        {
          query,
        }
      )
      .orderBy(
        'ts_rank(equipment.searchVector, plainto_tsquery(:query))',
        'DESC'
      )
      .limit(10)
      .getMany();
  }
}
