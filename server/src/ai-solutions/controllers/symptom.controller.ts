import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { SymptomService } from '../services/symptom.service';
import { Symptom } from '../entities/symptom.entity';

// We will create this DTO soon.
// import { CreateSymptomDto } from '../dtos/create-symptom.dto';

@Controller('symptoms')
export class SymptomController {
  constructor(private readonly symptomService: SymptomService) {}

  @Get()
  findAll(): Promise<Symptom[]> {
    return this.symptomService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Symptom> {
    return this.symptomService.findOne(id);
  }

  // Example of a simple create endpoint. We can make this more robust with DTOs.
  @Post()
  create(@Body() body: { description: string; equipmentType: string; equipmentModel?: string }): Promise<Symptom> {
    return this.symptomService.findOrCreate(body);
  }

  @Post(':symptomId/problems/:problemId')
  linkToProblem(
    @Param('symptomId', ParseIntPipe) symptomId: number,
    @Param('problemId', ParseIntPipe) problemId: number,
  ): Promise<Symptom> {
    return this.symptomService.linkToProblem(symptomId, problemId);
  }
} 