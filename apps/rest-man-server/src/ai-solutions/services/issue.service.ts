// issue.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue } from '../entities/issue.entity';
import { ProblemService } from './problem.service';
import { EquipmentService } from './equipment.service';
import { SolutionService } from './solution.service';
import { Business } from '../../admin/entities/business.entity';

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
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

  async createIssueWithTechnicianAssignment(createIssueDto: {
    businessId: number;
    userId: number;
    problemDescription: string;
    equipment?: any;
    language?: string;
  }) {
    // Get business with default technician
    const business = await this.businessRepository.findOne({
      where: { id: createIssueDto.businessId }
    });

    if (!business) {
      throw new Error('Business not found');
    }

    if (!business.defaultTechnicianId) {
      throw new Error('No default technician assigned to this business');
    }

    // Create problem
    const problem = await this.problemService.createProblem({
      description: createIssueDto.problemDescription,
      businessId: createIssueDto.businessId,
      userId: createIssueDto.userId,
    });

    // Use the provided equipment object if available
    let equipment = null;
    if (createIssueDto.equipment) {
      // If equipment is provided as an object, we can use its ID directly
      // or save it to the database if it's a new equipment
      if (createIssueDto.equipment.id) {
        equipment = createIssueDto.equipment;
      } else {
        // If it's a new equipment without ID, we might need to create it
        // For now, let's use the equipment identification service as fallback
        const equipmentDescription = `${createIssueDto.equipment.manufacturer || ''} ${createIssueDto.equipment.model || ''} ${createIssueDto.equipment.type || ''}`.trim();
        if (equipmentDescription) {
          equipment = await this.equipmentService.identifyEquipment(
            equipmentDescription,
            createIssueDto.businessId
          );
        }
      }
    }

    // Create issue with technician assignment
    const issue = this.issueRepository.create({
      problem,
      equipment,
      business: { id: createIssueDto.businessId },
      openedBy: { id: createIssueDto.userId },
      assignedTo: { id: business.defaultTechnicianId },
      status: 'open',
    });

    const savedIssue = await this.issueRepository.save(issue);

    return {
      issue: savedIssue,
      assignedTechnicianId: business.defaultTechnicianId,
      message: `Issue assigned to default technician`
    };
  }

  async createResolvedIssue(createResolvedIssueDto: {
    businessId: number;
    userId: number;
    problemDescription: string;
    solutionId: number;
    equipment?: any;
    language?: string;
  }) {
    // Get business
    const business = await this.businessRepository.findOne({
      where: { id: createResolvedIssueDto.businessId }
    });

    if (!business) {
      throw new Error('Business not found');
    }

    // Create problem
    const problem = await this.problemService.createProblem({
      description: createResolvedIssueDto.problemDescription,
      businessId: createResolvedIssueDto.businessId,
      userId: createResolvedIssueDto.userId,
    });

    // Use the provided equipment object if available
    let equipment = null;
    if (createResolvedIssueDto.equipment) {
      if (createResolvedIssueDto.equipment.id) {
        equipment = createResolvedIssueDto.equipment;
      } else {
        // If it's a new equipment without ID, we might need to create it
        const equipmentDescription = `${createResolvedIssueDto.equipment.manufacturer || ''} ${createResolvedIssueDto.equipment.model || ''} ${createResolvedIssueDto.equipment.type || ''}`.trim();
        if (equipmentDescription) {
          equipment = await this.equipmentService.identifyEquipment(
            equipmentDescription,
            createResolvedIssueDto.businessId
          );
        }
      }
    }

    // Create issue with status 'closed' and link to solution
    const issue = this.issueRepository.create({
      problem,
      equipment,
      business: { id: createResolvedIssueDto.businessId },
      openedBy: { id: createResolvedIssueDto.userId },
      solvedBy: { id: createResolvedIssueDto.userId }, // User solved it using the solution
      solution: { id: createResolvedIssueDto.solutionId },
      status: 'closed',
    });

    const savedIssue = await this.issueRepository.save(issue);

    return {
      issue: savedIssue,
      solutionId: createResolvedIssueDto.solutionId,
      message: `Issue created as resolved using solution ${createResolvedIssueDto.solutionId}`
    };
  }
}
