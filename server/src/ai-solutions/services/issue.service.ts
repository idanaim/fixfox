// issue.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue } from '../entities/issue.entity';
import { ProblemService } from './problem.service';
import { EquipmentService } from './equipment.service';
import { SolutionService } from './solution.service';
import { Business } from '../../admin/entities/business.entity';
import { Solution } from '../entities/solution.entity';

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(Solution)
    private solutionRepository: Repository<Solution>,
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
    // @ts-expect-error - TypeORM entity relationships require proper typing
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
      where: { id: createIssueDto.businessId },
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
        const equipmentDescription =
          `${createIssueDto.equipment.manufacturer || ''} ${createIssueDto.equipment.model || ''} ${createIssueDto.equipment.type || ''}`.trim();
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
      message: `Issue assigned to default technician`,
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
      where: { id: createResolvedIssueDto.businessId },
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
        const equipmentDescription =
          `${createResolvedIssueDto.equipment.manufacturer || ''} ${createResolvedIssueDto.equipment.model || ''} ${createResolvedIssueDto.equipment.type || ''}`.trim();
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
      message: `Issue created as resolved using solution ${createResolvedIssueDto.solutionId}`,
    };
  }

  /**
   * Get all issues for a specific business with pagination and filtering
   */
  async getIssuesByBusiness(
    businessId: number,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      equipmentId?: number;
      userId?: number;
    } = {}
  ) {
    const { page = 1, limit = 10, status, equipmentId, userId } = options;

    const queryBuilder = this.issueRepository
      .createQueryBuilder('issue')
      .leftJoinAndSelect('issue.problem', 'problem')
      .leftJoinAndSelect('issue.equipment', 'equipment')
      .leftJoinAndSelect('issue.solution', 'solution')
      .leftJoinAndSelect('issue.business', 'business')
      .leftJoinAndSelect('issue.openedBy', 'openedBy')
      .leftJoinAndSelect('issue.assignedTo', 'assignedTo')
      .leftJoinAndSelect('issue.solvedBy', 'solvedBy')
      .where('issue.businessId = :businessId', { businessId });

    // Apply additional filters
    if (status) {
      queryBuilder.andWhere('issue.status = :status', { status });
    }

    if (equipmentId) {
      queryBuilder.andWhere('issue.equipmentId = :equipmentId', {
        equipmentId,
      });
    }

    if (userId) {
      queryBuilder.andWhere(
        '(issue.openedBy = :userId OR issue.assignedTo = :userId OR issue.solvedBy = :userId)',
        { userId }
      );
    }

    // Order by most recent first
    queryBuilder.orderBy('issue.createdAt', 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Get results and total count
    const [issues, total] = await queryBuilder.getManyAndCount();

    return {
      issues,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get issues for a specific user across all their businesses
   */
  async getIssuesByUser(
    userId: number,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      businessId?: number;
    } = {}
  ) {
    const { page = 1, limit = 10, status, businessId } = options;

    const queryBuilder = this.issueRepository
      .createQueryBuilder('issue')
      .leftJoinAndSelect('issue.problem', 'problem')
      .leftJoinAndSelect('issue.equipment', 'equipment')
      .leftJoinAndSelect('issue.solution', 'solution')
      .leftJoinAndSelect('issue.business', 'business')
      .leftJoinAndSelect('issue.openedBy', 'openedBy')
      .leftJoinAndSelect('issue.assignedTo', 'assignedTo')
      .leftJoinAndSelect('issue.solvedBy', 'solvedBy')
      .where(
        '(issue.openedBy = :userId OR issue.assignedTo = :userId OR issue.solvedBy = :userId)',
        { userId }
      );

    // Apply additional filters
    if (status) {
      queryBuilder.andWhere('issue.status = :status', { status });
    }

    if (businessId) {
      queryBuilder.andWhere('issue.businessId = :businessId', { businessId });
    }

    // Order by most recent first
    queryBuilder.orderBy('issue.createdAt', 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Get results and total count
    const [issues, total] = await queryBuilder.getManyAndCount();

    return {
      issues,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single issue by ID with all related data
   */
  async getIssueById(issueId: number, businessId?: number) {
    const queryBuilder = this.issueRepository
      .createQueryBuilder('issue')
      .leftJoinAndSelect('issue.problem', 'problem')
      .leftJoinAndSelect('issue.equipment', 'equipment')
      .leftJoinAndSelect('issue.solution', 'solution')
      .leftJoinAndSelect('issue.business', 'business')
      .leftJoinAndSelect('issue.openedBy', 'openedBy')
      .leftJoinAndSelect('issue.assignedTo', 'assignedTo')
      .leftJoinAndSelect('issue.solvedBy', 'solvedBy')
      .leftJoinAndSelect('issue.chatSessions', 'chatSessions')
      .where('issue.id = :issueId', { issueId });

    // Optional business filter for security
    if (businessId) {
      queryBuilder.andWhere('issue.businessId = :businessId', { businessId });
    }

    const issue = await queryBuilder.getOne();

    if (!issue) {
      throw new Error('Issue not found');
    }

    return issue;
  }

  /**
   * Update issue status
   */
  async updateIssueStatus(
    issueId: number,
    status: string,
    businessId?: number,
    userId?: number
  ) {
    const issue = await this.getIssueById(issueId, businessId);

    issue.status = status;

    // If marking as closed, record who solved it
    if (status === 'closed' && userId) {
      issue.solvedBy = { id: userId } as any;
    }

    return this.issueRepository.save(issue);
  }

  /**
   * Assign technician to issue
   */
  async assignTechnician(
    issueId: number,
    technicianId: number,
    businessId?: number
  ) {
    const issue = await this.getIssueById(issueId, businessId);

    issue.assignedTo = { id: technicianId } as any;
    issue.status = 'assigned';

    return this.issueRepository.save(issue);
  }

  /**
   * Get issue statistics for a business
   */
  async getIssueStats(businessId: number) {
    const [total, open, assigned, inProgress, closed] = await Promise.all([
      this.issueRepository.count({ where: { business: { id: businessId } } }),
      this.issueRepository.count({
        where: { business: { id: businessId }, status: 'open' },
      }),
      this.issueRepository.count({
        where: { business: { id: businessId }, status: 'assigned' },
      }),
      this.issueRepository.count({
        where: { business: { id: businessId }, status: 'in_progress' },
      }),
      this.issueRepository.count({
        where: { business: { id: businessId }, status: 'closed' },
      }),
    ]);

    return {
      total,
      open,
      assigned,
      inProgress,
      closed,
      activeIssues: open + assigned + inProgress,
    };
  }

  /**
   * Update issue cost
   */
  async updateIssueCost(issueId: number, cost: number, businessId?: number) {
    const issue = await this.getIssueById(issueId, businessId);

    issue.cost = cost;

    return this.issueRepository.save(issue);
  }

  /**
   * Update issue treatment description
   */
  async updateIssueTreatment(
    issueId: number,
    treatment: string,
    businessId?: number,
    userId?: number
  ) {
    const issue = await this.getIssueById(issueId, businessId);

    // Check if issue already has a solution
    if (issue.solution) {
      // Update existing solution's treatment
      issue.solution.treatment = treatment;
      await this.solutionRepository.save(issue.solution);
    } else {
      // Create a new solution for this issue
      const newSolution = this.solutionRepository.create({
        problem: issue.problem,
        treatment: treatment,
        resolvedBy: userId ? `user:${userId}` : 'manual',
        source: `business:${businessId || issue.business.id}`,
        cause: 'Manual treatment added',
        effectiveness: 0,
        isExternal: false,
      });

      const savedSolution = await this.solutionRepository.save(newSolution);

      // Link the solution to the issue
      issue.solution = savedSolution;
    }

    if (userId) {
      issue.solvedBy = { id: userId } as any;
    }

    return this.issueRepository.save(issue);
  }

  /**
   * Close issue with cost and treatment
   */
  async closeIssue(
    issueId: number,
    cost?: number,
    treatment?: string,
    businessId?: number,
    userId?: number
  ) {
    const issue = await this.getIssueById(issueId, businessId);

    // Update issue status to closed
    issue.status = 'closed';

    // Set cost if provided
    if (cost !== undefined) {
      issue.cost = cost;
    }

    // Handle treatment if provided
    if (treatment) {
      if (issue.solution) {
        // Update existing solution's treatment
        issue.solution.treatment = treatment;
        await this.solutionRepository.save(issue.solution);
      } else {
        // Create a new solution for this issue
        const newSolution = this.solutionRepository.create({
          problem: issue.problem,
          treatment: treatment,
          resolvedBy: userId ? `user:${userId}` : 'manual',
          source: `business:${businessId || issue.business.id}`,
          cause: 'Issue closed with manual treatment',
          effectiveness: 0,
          isExternal: false,
        });

        const savedSolution = await this.solutionRepository.save(newSolution);

        // Link the solution to the issue
        issue.solution = savedSolution;
      }
    }

    // Record who solved it
    if (userId) {
      issue.solvedBy = { id: userId } as any;
    }

    return this.issueRepository.save(issue);
  }

  /**
   * Comprehensive update for issue - handles status, cost, treatment, and closing in one transaction
   */
  async updateIssueComprehensive(
    issueId: number,
    status?: string,
    cost?: number,
    treatment?: string,
    shouldClose?: boolean,
    businessId?: number,
    userId?: number
  ) {
    const issue = await this.getIssueById(issueId, businessId);

    // If should close or status is closed, use close logic
    if (shouldClose || status === 'closed') {
      return this.closeIssue(issueId, cost, treatment, businessId, userId);
    }

    // Update status if provided
    if (status && status !== issue.status) {
      issue.status = status;

      // If marking as closed, record who solved it
      if (status === 'closed' && userId) {
        issue.solvedBy = { id: userId } as any;
      }
    }

    // Update cost if provided
    if (cost !== undefined) {
      issue.cost = cost;
    }

    // Handle treatment if provided
    if (treatment) {
      if (issue.solution) {
        // Update existing solution's treatment
        issue.solution.treatment = treatment;
        await this.solutionRepository.save(issue.solution);
      } else {
        // Create a new solution for this issue
        const newSolution = this.solutionRepository.create({
          problem: issue.problem,
          treatment: treatment,
          resolvedBy: userId ? `user:${userId}` : 'manual',
          source: `business:${businessId || issue.business.id}`,
          cause: 'Manual treatment added',
          effectiveness: 0,
          isExternal: false,
        });

        const savedSolution = await this.solutionRepository.save(newSolution);

        // Link the solution to the issue
        issue.solution = savedSolution;
      }

      // Record who provided the treatment
      if (userId) {
        issue.solvedBy = { id: userId } as any;
      }
    }

    return this.issueRepository.save(issue);
  }
}
