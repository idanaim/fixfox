import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
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
      accountId: string;
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

  @Get('all')
  async findAll() {
    try {
      console.log('🔍 BusinessesController.findAll() called');
      const result = await this.businessesService.findAll();
      console.log('✅ BusinessesService.findAll() returned:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in BusinessesController.findAll():', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Get('test')
  async test() {
    console.log('🧪 BusinessesController.test() called');
    return { message: 'Test endpoint working', timestamp: new Date().toISOString() };
  }

  @Get(':accountId')
  async findAllByAdmin(@Param('accountId') accountId: string) {
    return this.businessesService.findAllByAccount(accountId);
  }

  @Delete(':id')
  async deleteBusiness(@Param('id') id: number) {
    return this.businessesService.delete(id);
  }
}
