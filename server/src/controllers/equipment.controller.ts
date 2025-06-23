import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { EquipmentService } from '../services/equipment.service';
import { Equipment } from '../entities/equipment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../admin/entities/user.entity';
import { EquipmentStatus } from '../ai-solutions/enums/equipment-status.enum';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  async create(
    @Body() createEquipmentDto: Partial<Equipment>,
    @Body('businessId') businessId: number
  ) {
    return this.equipmentService.create({
      ...createEquipmentDto,
      businessId
    });
  }

  @Get()
  async findAll(
    @Query('businessId') businessId: number
  ) {
    return this.equipmentService.findAll(businessId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: number,
    @Query('businessId') businessId: number
  ) {
    const equipment = await this.equipmentService.findById(id, businessId);

    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    return equipment;
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateEquipmentDto: Partial<Equipment>,
    @Query('businessId') businessId: number
  ) {
    // First check if equipment exists and belongs to the business
    const equipment = await this.equipmentService.findById(id, businessId);

    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    return this.equipmentService.update(id, businessId, updateEquipmentDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Query('businessId') businessId: number
  ) {
    // First check if equipment exists and belongs to the business
    const equipment = await this.equipmentService.findById(id, businessId);

    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    await this.equipmentService.remove(id, businessId);
    return { success: true };
  }

  @Get('search/query')
  async search(
    @Query('q') query: string,
    @Query('businessId') businessId: number
  ) {
    if (!query) {
      return this.equipmentService.findAll(businessId);
    }
    return this.equipmentService.search(businessId, query);
  }

  @Get('search/vector')
  async searchByVector(
    @Query('q') query: string,
    @Query('businessId') businessId: number
  ) {
    if (!query) {
      return this.equipmentService.findAll(businessId);
    }
    return this.equipmentService.searchByVector(businessId, query);
  }

  @Get('category/:category')
  async findByCategory(
    @Param('category') category: string,
    @Query('businessId') businessId: number
  ) {
    return this.equipmentService.findByCategory(businessId, category);
  }

  @Get('status/:status')
  async findByStatus(
    @Param('status') status: EquipmentStatus,
    @Query('businessId') businessId: number
  ) {
    return this.equipmentService.findByStatus(businessId, status);
  }

  @Get('maintenance/due')
  async findDueForMaintenance(
    @Query('businessId') businessId: number
  ) {
    return this.equipmentService.findDueForMaintenance(businessId);
  }

  @Post('bulk')
  async bulkCreate(
    @Body() equipments: Partial<Equipment>[],
    @Body('businessId') businessId: number
  ) {
    // Ensure businessId is set for all equipment
    const equipmentsWithBusiness = equipments.map(equipment => ({
      ...equipment,
      businessId
    }));

    return this.equipmentService.bulkCreate(equipmentsWithBusiness);
  }
}
