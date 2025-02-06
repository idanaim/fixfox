import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BusinessesService } from '../services/businesses.service';
import { Business } from '../entities/business.entity';

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  async createBusiness(
    @Body()
    body: {
      name: string;
      address: string;
      mobile: string;
      type: string;
    }
  ): Promise<Business> {
    return this.businessesService.create(body);
  }

  @Get()
  async findAll(): Promise<Business[]> {
    return this.businessesService.findAll();
  }

  @Get(':adminId')
  async findAllByAdmin(@Param('adminId') adminId: number) {
    return this.businessesService.findAllByAdmin(adminId);
  }
}
