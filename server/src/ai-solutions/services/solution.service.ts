import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Solution } from '../entities/solution.entity';
import { Problem } from '../entities/problem.entity';
import { AIService } from './ai.service';
import {
  CreateSolutionDto,
  UpdateSolutionDto,
  SolutionResponseDto,
} from '../dtos/solution.dto';

@Injectable()
export class SolutionService {
  constructor(
    @InjectRepository(Solution)
    private solutionRepository: Repository<Solution>,
    @InjectRepository(Problem)
    private problemRepository: Repository<Problem>,
    private aiService: AIService
  ) {}

  /**
   * Find or create a solution for a problem
   */
  async findOrCreateSolution(problemId: number): Promise<Solution[]> {
    const problem = await this.problemRepository.findOne({
      where: { id: problemId },
      relations: ['equipment'],
    });

    if (problem) {
      // Check existing solutions
      const existing = await this.solutionRepository
        .createQueryBuilder('solution')
        .innerJoin('solution.problem', 'problem')
        .where('problem.equipmentId = :equipmentId', {
          equipmentId: problem?.equipment?.id,
        })
        .orderBy('solution.effectiveness', 'DESC')
        .getMany();

      if (existing.length > 0) return existing;
    }

    // Generate new solution via AI
    return this.generateAISolution(problem);
  }

  /**
   * Generate solution using AI
   */
  private async generateAISolution(problem: Problem): Promise<Solution[]> {
    const aiResponse = await this.aiService.generateTroubleshootingGuide(
      problem?.equipment,
      problem?.description
    );

    const solution = this.solutionRepository.create({
      cause: aiResponse.rootCause,
      treatment: aiResponse.steps.join('\n'),
      resolvedBy: 'AI',
      source: `ai:${problem.equipment.business.id}`,
      effectiveness: 0,
      problem: problem,
    });

    return [await this.solutionRepository.save(solution)];
  }

  /**
   * Create a new solution
   */
  async create(
    createSolutionDto: CreateSolutionDto,
    userId?: number,
    businessId?: number
  ): Promise<Solution> {
    const problem = await this.problemRepository.findOne({
      where: { id: createSolutionDto.problemId },
    });

    if (!problem) {
      throw new NotFoundException(
        `Problem with ID ${createSolutionDto.problemId} not found`
      );
    }

    const solution = this.solutionRepository.create({
      cause: problem.description,
      treatment: createSolutionDto.treatment,
      resolvedBy: `${userId}`,
      source: `ai:${businessId}`,
      effectiveness: 0,
      problem: problem,
    });

    return this.solutionRepository.save(solution);
  }

  /**
   * Find all solutions
   */
  async findAll(): Promise<Solution[]> {
    return this.solutionRepository.find({
      relations: ['problem'],
      order: { effectiveness: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Find solutions by problem ID
   */
  async findByProblem(problemId: number): Promise<Solution[]> {
    return this.solutionRepository.find({
      where: { problem: { id: problemId } },
      relations: ['problem'],
      order: { effectiveness: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Find a solution by ID
   */
  async findOne(id: number): Promise<Solution> {
    const solution = await this.solutionRepository.findOne({
      where: { id },
      relations: ['problem'],
    });

    if (!solution) {
      throw new NotFoundException(`Solution with ID ${id} not found`);
    }

    return solution;
  }

  /**
   * Update a solution
   */
  async update(
    id: number,
    updateSolutionDto: UpdateSolutionDto
  ): Promise<Solution> {
    const solution = await this.findOne(id);

    Object.assign(solution, updateSolutionDto);

    return this.solutionRepository.save(solution);
  }

  /**
   * Delete a solution
   */
  async remove(id: number): Promise<void> {
    const solution = await this.findOne(id);
    await this.solutionRepository.remove(solution);
  }

  /**
   * Record solution effectiveness
   */
  async recordSolutionEffectiveness(
    solutionId: number,
    effective: boolean
  ): Promise<void> {
    const solution = await this.findOne(solutionId);

    solution.effectiveness += effective ? 1 : -1;
    if (solution.effectiveness < 0) solution.effectiveness = 0;

    await this.solutionRepository.save(solution);
  }

  /**
   * Map solution entity to response DTO
   */
  mapToResponseDto(solution: Solution): SolutionResponseDto {
    // Determine the source context
    let sourceContext = null;

    if (solution.source) {
      if (solution.source.startsWith('ai:')) {
        sourceContext = {
          type: 'ai_generated' as const,
          label: 'AI Solution',
        };
      } else if (solution.source.startsWith('dtos:')) {
        sourceContext = {
          type: 'current_business' as const,
          label: 'Current Business',
        };
      } else {
        sourceContext = {
          type: 'other_business' as const,
          label: 'Other Business',
        };
      }
    }

    return {
      id: solution.id,
      cause: solution.cause,
      treatment: solution.treatment,
      resolvedBy: solution.resolvedBy,
      cost: solution.cost,
      effectiveness: solution.effectiveness,
      isExternal: solution.isExternal,
      source: solution.source,
      createdAt: solution.createdAt,
      problemId: solution.problem?.id,
      sourceContext,
    };
  }
}
