import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Technician } from './technician.entity';
import { Location } from './location.entity';
import { Rating } from './rating.entity';
import { CreateTechnicianDto } from './dtos/create-technician.dto';
import { UpdateTechnicianDto } from './dtos/update-technician.dto';
import { CreateRatingDto } from './dtos/create-rating.dto';

@Injectable()
export class TechnicianService {
  constructor(
    @InjectRepository(Technician)
    private technicianRepository: Repository<Technician>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
  ) {}

  async create(createTechnicianDto: CreateTechnicianDto): Promise<Technician> {
    const locations = await this.locationRepository.findByIds(createTechnicianDto.locationIds);
    if (locations.length !== createTechnicianDto.locationIds.length) {
      throw new NotFoundException('One or more locations not found');
    }

    const technician = this.technicianRepository.create({
      ...createTechnicianDto,
      locations,
    });

    return this.technicianRepository.save(technician);
  }

  async findAll(): Promise<Technician[]> {

    return this.technicianRepository.find({
      relations: ['locations', 'ratings'],
    });
  }

  async findOne(id: string): Promise<Technician> {
    const technician = await this.technicianRepository.findOne({
      where: { technician_id: id },
      relations: ['locations', 'ratings'],
    });

    if (!technician) {
      throw new NotFoundException(`Technician with ID ${id} not found`);
    }

    return technician;
  }

  async update(id: string, updateTechnicianDto: UpdateTechnicianDto): Promise<Technician> {
    const technician = await this.findOne(id);

    if (updateTechnicianDto.locationIds) {
      const locations = await this.locationRepository.findByIds(updateTechnicianDto.locationIds);
      if (locations.length !== updateTechnicianDto.locationIds.length) {
        throw new NotFoundException('One or more locations not found');
      }
      technician.locations = locations;
    }

    Object.assign(technician, updateTechnicianDto);
    return this.technicianRepository.save(technician);
  }

  async remove(id: string): Promise<void> {
    const result = await this.technicianRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Technician with ID ${id} not found`);
    }
  }

  async addRating(technicianId: string, createRatingDto: CreateRatingDto): Promise<Rating> {
    const technician = await this.findOne(technicianId);
    const rating = this.ratingRepository.create({
      ...createRatingDto,
      technician,
    });

    return this.ratingRepository.save(rating);
  }

  async getTechnicianRatings(technicianId: string): Promise<Rating[]> {
    const technician = await this.findOne(technicianId);
    return this.ratingRepository.find({
      where: { technician: { technician_id: technicianId } },
    });
  }

  async getAverageRatings(technicianId: string) {
    const ratings = await this.getTechnicianRatings(technicianId);

    if (ratings.length === 0) {
      return null;
    }

    const sum = ratings.reduce((acc, rating) => ({
      responseTime: acc.responseTime + rating.response_time,
      price: acc.price + rating.price,
      qualityAccuracy: acc.qualityAccuracy + rating.quality_accuracy,
      professionalism: acc.professionalism + rating.professionalism,
      efficiency: acc.efficiency + rating.efficiency,
      aesthetics: acc.aesthetics + rating.aesthetics,
    }), {
      responseTime: 0,
      price: 0,
      qualityAccuracy: 0,
      professionalism: 0,
      efficiency: 0,
      aesthetics: 0,
    });

    const count = ratings.length;
    return {
      responseTime: Number((sum.responseTime / count).toFixed(2)),
      price: Number((sum.price / count).toFixed(2)),
      qualityAccuracy: Number((sum.qualityAccuracy / count).toFixed(2)),
      professionalism: Number((sum.professionalism / count).toFixed(2)),
      efficiency: Number((sum.efficiency / count).toFixed(2)),
      aesthetics: Number((sum.aesthetics / count).toFixed(2)),
      totalRatings: count,
    };
  }

  async findByProfession(profession: string): Promise<Technician[]> {
    return this.technicianRepository
      .createQueryBuilder('technician')
      .where('dtos.professions @> ARRAY[:profession]::profession[]', { profession })
      .leftJoinAndSelect('dtos.locations', 'location')
      .leftJoinAndSelect('dtos.ratings', 'rating')
      .getMany();
  }

  async findByLocation(city: string): Promise<Technician[]> {
    return this.technicianRepository
      .createQueryBuilder('technician')
      .leftJoinAndSelect('dtos.locations', 'location')
      .leftJoinAndSelect('dtos.ratings', 'rating')
      .where('location.city = :city', { city })
      .getMany();
  }
}
