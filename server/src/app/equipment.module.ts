import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipmentController } from '../controllers/equipment.controller';
import { EquipmentService } from '../services/equipment.service';
import { Equipment } from '../entities/equipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Equipment])],
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}
