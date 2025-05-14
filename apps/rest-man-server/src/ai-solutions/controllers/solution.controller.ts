import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { SolutionService } from '../services/solution.service';
import { CreateSolutionDto, UpdateSolutionDto, SolutionResponseDto } from '../dtos/solution.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../admin/entities/user.entity';

@Controller('solutions')
export class SolutionController {
  constructor(private readonly solutionService: SolutionService) {}

  @Post()
  async create(
    @Body() body: {   user: User,solution: CreateSolutionDto}
  ): Promise<SolutionResponseDto> {
    // Set source based on the current user

    if (!body.solution?.source) {
      body.solution.source = `technician:${body.user.id}`;
    }

    // Set resolvedBy if not provided
    if (!body.solution?.resolvedBy) {
      body.solution.resolvedBy = body.user.name;
    }

    const solution = await this.solutionService.create(body.solution);
    return this.solutionService.mapToResponseDto(solution);
  }

  @Get()
  async findAll(
    @Query('problemId') problemId?: number
  ): Promise<SolutionResponseDto[]> {
    // If problemId is provided, get solutions for that problem
    const solutions = problemId
      ? await this.solutionService.findByProblem(problemId)
      : await this.solutionService.findAll();

    return solutions.map(solution => this.solutionService.mapToResponseDto(solution));
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<SolutionResponseDto> {
    const solution = await this.solutionService.findOne(id);
    return this.solutionService.mapToResponseDto(solution);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateSolutionDto: UpdateSolutionDto
  ): Promise<SolutionResponseDto> {
    const solution = await this.solutionService.update(id, updateSolutionDto);
    return this.solutionService.mapToResponseDto(solution);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number): Promise<void> {
    await this.solutionService.remove(id);
  }

  @Post(':id/effectiveness')
  async recordEffectiveness(
    @Param('id') id: number,
    @Body() body: { effective: boolean }
  ): Promise<{ success: boolean }> {
    await this.solutionService.recordSolutionEffectiveness(id, body.effective);
    return { success: true };
  }

  @Post('generate-for-problem/:problemId')
  async generateForProblem(
    @Param('problemId') problemId: number
  ): Promise<SolutionResponseDto[]> {
    const solutions = await this.solutionService.findOrCreateSolution(problemId);
    return solutions.map(solution => this.solutionService.mapToResponseDto(solution));
  }
}
