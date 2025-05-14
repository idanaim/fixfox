// issue.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue } from '../entities/issue.entity';
import { ProblemService } from './problem.service';
import { EquipmentService } from './equipment.service';
import { SolutionService } from './solution.service';

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
    private problemService: ProblemService,
    private equipmentService: EquipmentService,
    private solutionService: SolutionService
  ) {}

  async createIssue(createIssueDto: {
    businessId: number;
    userId: number;
    problemDescription: string;
    equipmentDescription: string;
  }) {
    // Problem identification

    const problem = await this.problemService.createProblem({
      description: createIssueDto.problemDescription,
      businessId: createIssueDto.businessId,
      userId: createIssueDto.userId,
    });
    // Equipment recognition
    const equipment = await this.equipmentService.identifyEquipment(
      createIssueDto.equipmentDescription,
      createIssueDto.businessId
    );

    // Create issue
    // @ts-ignore
    const issue = this.issueRepository.create({
      problem,
      equipment,
      business: { id: createIssueDto.businessId },
      openedBy: { id: createIssueDto.userId },
      status: 'open',
    });

    // Find solutions
    const solutions = await this.solutionService.findOrCreateSolution(
      problem?.id || 0
    );

    return { issue: await this.issueRepository.save(issue), solutions };
  }
}
