import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Symptom } from '../entities/symptom.entity';
import { Problem } from '../entities/problem.entity';
// We will create this DTO in the next step.
// import { CreateSymptomDto } from '../dtos/create-symptom.dto';

@Injectable()
export class SymptomService {
  constructor(
    @InjectRepository(Symptom)
    private readonly symptomRepository: Repository<Symptom>,
    @InjectRepository(Problem)
    private readonly problemRepository: Repository<Problem>,
  ) {}

  /**
   * Finds an existing symptom by its description and equipment type,
   * or creates a new one if it doesn't exist.
   * @param symptomData - The description, equipment type, and model.
   * @returns The found or newly created Symptom entity.
   */
  async findOrCreate(symptomData: {
    description: string;
    equipmentType: string;
    equipmentModel?: string;
  }): Promise<Symptom> {
    const { description, equipmentType, equipmentModel } = symptomData;

    const existingSymptom = await this.symptomRepository.findOne({
      where: { description, equipmentType },
    });

    if (existingSymptom) {
      return existingSymptom;
    }

    const newSymptom = this.symptomRepository.create({
      description,
      equipmentType,
      equipmentModel,
    });

    return this.symptomRepository.save(newSymptom);
  }

  /**
   * Links a symptom to a problem.
   * @param symptomId - The ID of the symptom.
   * @param problemId - The ID of the problem.
   * @returns The updated Symptom entity with the new relationship.
   */
  async linkToProblem(symptomId: number, problemId: number): Promise<Symptom> {
    const symptom = await this.symptomRepository.findOne({
      where: { id: symptomId },
      relations: ['problems'],
    });

    if (!symptom) {
      throw new NotFoundException(`Symptom with ID ${symptomId} not found`);
    }

    const problem = await this.problemRepository.findOne({
      where: { id: problemId },
    });

    if (!problem) {
      throw new NotFoundException(`Problem with ID ${problemId} not found`);
    }

    // Add the problem to the symptom's list of problems if it's not already there
    if (!symptom.problems.some((p) => p.id === problem.id)) {
      symptom.problems.push(problem);
    }

    return this.symptomRepository.save(symptom);
  }

  findAll(): Promise<Symptom[]> {
    return this.symptomRepository.find({ relations: ['problems'] });
  }

  findOne(id: number): Promise<Symptom> {
    const symptom = this.symptomRepository.findOne({
        where: { id },
        relations: ['problems'],
    });
    if (!symptom) {
        throw new NotFoundException(`Symptom with ID ${id} not found`);
    }
    return symptom;
  }
} 