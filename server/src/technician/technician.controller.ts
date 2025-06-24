import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { CreateTechnicianDto } from './dtos/create-technician.dto';
import { UpdateTechnicianDto } from './dtos/update-technician.dto';
import { CreateRatingDto } from './dtos/create-rating.dto';

@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post()
  create(@Body() createTechnicianDto: CreateTechnicianDto) {
    return this.technicianService.create(createTechnicianDto);
  }

  @Get()
  findAll() {
    return this.technicianService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.technicianService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTechnicianDto: UpdateTechnicianDto
  ) {
    return this.technicianService.update(id, updateTechnicianDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.technicianService.remove(id);
  }

  @Post(':id/ratings')
  addRating(@Param('id') id: string, @Body() createRatingDto: CreateRatingDto) {
    return this.technicianService.addRating(id, createRatingDto);
  }

  @Get(':id/ratings')
  getTechnicianRatings(@Param('id') id: string) {
    return this.technicianService.getTechnicianRatings(id);
  }

  @Get(':id/ratings/average')
  getAverageRatings(@Param('id') id: string) {
    return this.technicianService.getAverageRatings(id);
  }

  @Get('profession/:profession')
  findByProfession(@Param('profession') profession: string) {
    return this.technicianService.findByProfession(profession);
  }

  @Get('location/:city')
  findByLocation(@Param('city') city: string) {
    return this.technicianService.findByLocation(city);
  }
}
