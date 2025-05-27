import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Problem } from '../entities/problem.entity';
import { Equipment } from '../../entities/equipment.entity';
import { AIService } from './ai.service';
import { CreateProblemDto } from '../dtos/create-problem.dto';
import { Issue } from '../entities/issue.entity';
import { EnhancedDiagnosisResult } from '../interfaces/enhanced-diagnosis.interface';

@Injectable()
export class ProblemService {
  constructor(
    @InjectRepository(Problem)
    private problemRepository: Repository<Problem>,
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
    private aiService: AIService
  ) {}

  async createProblem(createProblemDto: CreateProblemDto): Promise<Problem> {
    // @ts-ignore
    const problem = this.problemRepository.create({
      description: createProblemDto.description,
      business: { id: createProblemDto.businessId },
      reportedBy: { id: createProblemDto.userId },
      ...(createProblemDto.equipmentId && {
        equipment: { id: createProblemDto.equipmentId },
      }),
    });

    // @ts-ignore
    return this.problemRepository.save(problem);
  }

  async findSimilarProblems(
    description: string,
    equipmentId: number,
    businessId: number
  ): Promise<Problem[]> {
    // First, get problems that are associated with the same equipment type
    // to narrow down the context
    if (!equipmentId) {
      return [];
    }

    const equipment = await this.equipmentRepository.findOne({
      where: { id: equipmentId },
      relations: ['problems', 'problems.solutions'],
    });

    if (!equipment) {
      return [];
    }
    // Use AI to find semantically similar problems
    const similarProblems = await this.aiService.findSimilarProblems(
      description,
      equipment.problems || []
    );

    return similarProblems;
  }

  async linkProblemToEquipment(
    problemId: number,
    equipmentId: number
  ): Promise<Problem> {
    return this.problemRepository.save({
      id: problemId,
      equipment: { id: equipmentId },
    });
  }

  // async getProblemsByBusiness(businessId: number): Promise<Problem[]> {
  //   return this.problemRepository.find({
  //     where: { business: { id: businessId } },
  //     relations: ['equipment', 'reportedBy'],
  //     order: { createdAt: 'DESC' }
  //   });
  // }

  async getProblemWithSolutions(problemId: number): Promise<Problem> {
    return this.problemRepository.findOne({
      where: { id: problemId },
      relations: ['solutions', 'equipment', 'business'],
    });
  }

  async categorizeProblem(problemId: number): Promise<{ category: string }> {
    const problem = await this.problemRepository.findOneBy({ id: problemId });
    if (!problem) throw new Error('Problem not found');

    const categories = await this.aiService.categorizeProblem(
      problem.description,
      problem.equipment?.type
    );

    return { category: categories[0] };
  }

  async getProblemsByEquipment(
    equipmentId: number,
    businessId: number
  ): Promise<Problem[]> {
    return this.problemRepository.find({
      where: {
        equipment: { id: equipmentId },
      },
      relations: ['solutions', 'equipment'],
      order: { createdAt: 'DESC' },
    });
  }

  async diagnoseProblem(
    description: string,
    equipmentId: number,
    businessId: number,
    language = 'en'
  ): Promise<any> {
    // First, try to find similar problems that already have solutions
    const similarProblems = await this.findSimilarProblems(
      description,
      equipmentId,
      businessId
    );

    // If we found similar problems with solutions, return those
    const problemsWithSolutions = similarProblems.filter(
      (problem) => problem.solutions && problem.solutions.length > 0
    );

    if (problemsWithSolutions.length > 0) {
      return {
        type: 'existing_solutions',
        message:
          language === 'he'
            ? 'נמצאו פתרונות קודמים לבעיות דומות'
            : 'Found existing solutions for similar problems',
        problems: problemsWithSolutions,
      };
    }

    // If no similar problems with solutions, use AI for diagnosis
    const equipment = await this.equipmentRepository.findOne({
      where: { id: equipmentId },
    });

    if (!equipment) {
      throw new Error(
        language === 'he' ? 'הציוד לא נמצא' : 'Equipment not found'
      );
    }

    // Generate AI diagnosis
    const diagnosis = await this.aiService.generateDiagnosis(
      description,
      {
        type: equipment.type,
        manufacturer: equipment.manufacturer,
        model: equipment.model,
      },
      language
    );

    return {
      type: 'ai_diagnosis',
      message:
        language === 'he'
          ? 'נוצר אבחון מבוסס בינה מלאכותית'
          : 'Generated AI-based diagnosis',
      diagnosis,
    };
  }

  /**
   * Enhanced problem diagnosis that follows a multi-stage approach:
   * 1. First checks issues in the current business for the specified equipment
   * 2. Checks if the problem is similar using AI
   * 3. If similar, get the solution with "Used before in this business" badge
   * 4. If not similar, check all problems in the problem table with the same type/model
   * 5. Show solutions with badge "Other business use it"
   * 6. If no solutions exist in the problem table, use AI to generate solutions
   */
  async enhancedDiagnosis(
    description: string,
    equipmentId: number,
    businessId: number,
    maxResults = 5,
    language = 'en'
  ): Promise<EnhancedDiagnosisResult> {
    // Stage 1: Get all issues with the same equipment ID in the current business
    const businessIssues = await this.issueRepository
      .createQueryBuilder('issue')
      .leftJoinAndSelect('issue.problem', 'problem')
      .leftJoinAndSelect('issue.equipment', 'equipment')
      .leftJoinAndSelect('issue.solution', 'solution')
      .where('issue.businessId = :businessId', { businessId })
      .andWhere('issue.equipmentId = :equipmentId', { equipmentId })
      .orderBy('issue.createdAt', 'DESC')
      .getMany();
    if (businessIssues.length > 0) {
      // Use AI to check if any of these problems are similar to the current description
      const issueDescriptions = businessIssues.map((issue) => ({
        id: issue.id,
        description: issue.problem?.description || '',
      }));

      // Get IDs of similar issues
      const similarIssueIds = await this.aiService.findSimilarIssues(
        description,
        issueDescriptions,
        maxResults
      );

      // Get similar issues with solutions
      const similarIssues = businessIssues
        .filter((issue) => similarIssueIds.includes(issue.id) && issue.solution)
        .slice(0, maxResults);

      if (similarIssues.length > 0) {
        return {
          type: 'issue_matches',
          source: 'current_business',
          issues: similarIssues,
          message:
            language === 'he'
              ? 'נמצאו בעיות דומות עם פתרונות ששימשו בעבר בעסק שלך'
              : 'Found similar issues with solutions used before in your business',
        };
      }
    }

    // Stage 2: If no direct matches in the business, look for problems with the same equipment type
    const equipment = await this.equipmentRepository.findOne({
      where: { id: equipmentId },
    });

    if (!equipment) {
      throw new Error(
        language === 'he' ? 'הציוד לא נמצא' : 'Equipment not found'
      );
    }

    // Get problems for similar equipment from other businesses
    const problemMatches = await this.findSimilarProblemsByType(
      description,
      equipment.type,
      equipment.manufacturer,
      equipment.model,
      maxResults
    );

    if (problemMatches.length > 0) {
      return {
        type: 'problem_matches',
        source: 'other_business',
        problems: problemMatches,
        message:
          language === 'he'
            ? 'נמצאו פתרונות ששימשו עסקים אחרים עבור ציוד דומה'
            : 'Found solutions used by other businesses for similar equipment',
      };
    }

    // Stage 3: If no matches in problems table, use AI to generate solutions
    const diagnosis = await this.aiService.generateDiagnosis(
      description,
      {
        type: equipment.type,
        manufacturer: equipment.manufacturer,
        model: equipment.model,
      },
      language
    );

    return {
      type: 'ai_diagnosis',
      source: 'ai_generated',
      diagnosis,
      message:
        language === 'he'
          ? 'נוצרו פתרונות מבוססי בינה מלאכותית בהתבסס על התיאור שלך'
          : 'Generated AI solutions based on your description',
    };
  }

  /**
   * Find related issues for the equipment in the specified business
   */
  private async findRelatedIssues(
    description: string,
    equipmentId: number,
    businessId: number,
    limit: number
  ): Promise<any[]> {
    // Get issues for this equipment at this business
    const issues = await this.issueRepository
      .createQueryBuilder('issue')
      .leftJoinAndSelect('issue.problem', 'problem')
      .leftJoinAndSelect('issue.equipment', 'equipment')
      .leftJoinAndSelect('issue.solution', 'solution')
      .where('issue.businessId = :businessId', { businessId })
      .andWhere('issue.equipmentId = :equipmentId', { equipmentId })
      .orderBy('issue.createdAt', 'DESC')
      .take(limit * 3) // Get more than we need for semantic filtering
      .getMany();

    if (issues.length === 0) {
      return [];
    }

    // Use AI to find semantically similar issues
    const issueDescriptions = issues.map((issue) => ({
      id: issue.id,
      description: issue.problem?.description || '',
      // symptoms: issue.symptoms || ''
    }));

    // Use AI to rank the issues by similarity
    const similarIssueIds = await this.aiService.findSimilarIssues(
      description,
      issueDescriptions,
      limit
    );

    // Return the full issue objects for the similar issues
    return issues
      .filter((issue) => similarIssueIds.includes(issue.id))
      .slice(0, limit);
  }

  /**
   * Find similar problems by appliance type, ordered by model and manufacturer match
   * and then check semantic similarity using AI
   */
  private async findSimilarProblemsByType(
    description: string,
    type: string,
    manufacturer: string,
    model: string,
    limit: number
  ): Promise<Problem[]> {
    // First get problems for this type of equipment
    const typeProblems = await this.problemRepository
      .createQueryBuilder('problem')
      .leftJoinAndSelect('problem.equipment', 'equipment')
      .leftJoinAndSelect('problem.solutions', 'solutions')
      .where('equipment.type = :type', { type })
      .orderBy('problem.createdAt', 'DESC')
      .getMany();

    if (typeProblems.length === 0) {
      return [];
    }

    // Filter to only include problems with solutions
    const problemsWithSolutions = typeProblems.filter(
      (problem) => problem.solutions && problem.solutions.length > 0
    );

    if (problemsWithSolutions.length === 0) {
      return [];
    }

    // Score problems by equipment similarity
    const scoredProblems = problemsWithSolutions.map((problem) => {
      let score = 0;

      // Higher score for same manufacturer
      if (
        problem.equipment?.manufacturer?.toLowerCase() ===
        manufacturer.toLowerCase()
      ) {
        score += 2;
      }

      // Highest score for same model
      if (problem.equipment?.model?.toLowerCase() === model.toLowerCase()) {
        score += 3;
      }

      return { problem, score };
    });

    // Sort by score (descending) and then by creation date (newest first)
    scoredProblems.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }

      return (
        new Date(b.problem.createdAt).getTime() -
        new Date(a.problem.createdAt).getTime()
      );
    });

    // Get the top candidates based on equipment similarity
    const topProblems = scoredProblems.map((sp) => sp.problem);

    // Use AI to find semantically similar problems from the candidates
    const similarProblems = await this.aiService.findSimilarProblems(
      description,
      topProblems
    );

    // Return only the problems that the AI found to be similar
    return similarProblems.slice(0, limit);
  }
}
