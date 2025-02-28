import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
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

  @Put(':id')
async updateBusiness(
  @Param('id') id: number,
  @Body()
  body: {
    name: string;
    address: string;
    mobile: string;
    type: string;
  }
): Promise<Business> {
  return this.businessesService.update(id, body);
  }

  @Get()
  async findAll(): Promise<Business[]> {
    return this.businessesService.findAll();
  }

  @Get(':adminId')
  async findAllByAdmin(@Param('adminId') adminId: number) {
    return this.businessesService.findAllByAdmin(adminId);
  }

  @Delete(':id')
  async deleteBusiness(@Param('id') id: number) {
    return this.businessesService.delete(id);
  }
}
