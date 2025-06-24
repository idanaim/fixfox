import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechnicianController } from './technician.controller';
import { TechnicianService } from './technician.service';
import { Technician } from './technician.entity';
import { Location } from './location.entity';
import { Rating } from './rating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Technician, Location, Rating])],
  controllers: [TechnicianController],
  providers: [TechnicianService],
  exports: [TechnicianService],
})
export class TechnicianModule {}
