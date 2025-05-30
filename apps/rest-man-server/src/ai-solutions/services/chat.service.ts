import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from '../entities/chat-session.entity';
import { ChatMessage } from '../entities/chat-message.entity';
import { Issue } from '../entities/issue.entity';
import { Equipment } from '../entities/equipment.entity';
import { AIService } from './ai.service';
import { Problem } from '../entities/problem.entity';
import { ProblemService } from './problem.service';
import { CreateProblemDto } from '../dtos/create-problem.dto';
import { SolutionService } from './solution.service';
import { CreateSolutionDto } from '../dtos/solution.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
    @InjectRepository(Problem)
    private problemRepository: Repository<Problem>,
    private aiService: AIService,
    private problemService: ProblemService,
    private solutionService: SolutionService
  ) {}

  async createSession(
    userId: number,
    businessId: number,
    language = 'en'
  ): Promise<ChatSession> {
    const session = this.chatSessionRepository.create({
      user: { id: userId },
      business: { id: businessId },
      status: 'active',
      metadata: {
        currentStep: 'initial',
        context: {},
        language
      },
    });
    return this.chatSessionRepository.save(session);
  }

  async addMessage(
    sessionId: number,
    content: string,
    type: 'user' | 'system' | 'ai',
    metadata?: any
  ): Promise<ChatMessage> {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId },
      select: ['metadata']
    });

    const language = session?.metadata?.language || 'en';
    const message = this.chatMessageRepository.create({
      session: { id: sessionId },
      content,
      type,
      metadata: {
        ...metadata,
        language
      },
    });
    return this.chatMessageRepository.save(message);
  }

  async getSessionMessages(sessionId: number): Promise<ChatMessage[]> {
    return this.chatMessageRepository.find({
      where: { session: { id: sessionId } },
      order: { createdAt: 'ASC' },
      relations: ['session'],
    });
  }

  async updateSessionStatus(
    sessionId: number,
    status: string,
    metadata?: any
  ): Promise<ChatSession> {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    session.status = status;
    if (metadata) {
      session.metadata = { ...session.metadata, ...metadata };
    }

    return this.chatSessionRepository.save(session);
  }

  async enhanceProblemDescription(
    sessionId: number,
    description: string,
    equipment: Equipment,
    language = 'en'
  ): Promise<{
    originalDescription: string;
    enhancedDescription: string;
    potentialEquipmentTypes?: string[];
  }> {
    // First, record the original description in the session
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Update the session metadata to store the original description
    await this.updateSessionStatus(sessionId, 'enhancing_description', {
      originalDescription: description,
    });

    // Use AI to improve the description
    const enhancedDescription = await this.aiService.enhanceProblemDescription(
      description,
      language,
      equipment,
    );

    // Extract potential equipment types from the enhanced description
    const equipmentType = await this.aiService.identifyEquipmentType(enhancedDescription);
    const potentialEquipmentTypes = equipmentType ? [equipmentType] : [];

    // Update session with the extracted equipment types
    await this.updateSessionStatus(sessionId, 'description_enhanced', {
      enhancedDescription,
      potentialEquipmentTypes
    });

    // Return both the original and enhanced descriptions along with potential equipment types
    return {
      originalDescription: description,
      enhancedDescription,
      potentialEquipmentTypes
    };
  }

  async findEquipmentByDescription(
    businessId: number,
    description: string
  ): Promise<Equipment[]> {
    // Use AI to extract equipment types from the description
    const typeDescByAi = await this.aiService.identifyEquipmentType(description);

    // Create a more flexible search query that can match partial equipment names
    return this.equipmentRepository
      .createQueryBuilder('equipment')
      .where('equipment.businessId = :businessId', { businessId })
      .andWhere(
        '(LOWER(equipment.type) LIKE LOWER(:search) OR ' +
        'LOWER(equipment.manufacturer) LIKE LOWER(:search) OR ' +
        'LOWER(equipment.model) LIKE LOWER(:search) OR ' +
        'LOWER(equipment.category) LIKE LOWER(:search))',
        { search: `%${typeDescByAi || description}%` }
      )
      .getMany();
  }

  async createIssueFromSession(
    sessionId: number,
    equipmentId: number,
    problem: CreateProblemDto,
    solution?: CreateSolutionDto
  ): Promise<Issue> {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['user', 'business'],
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Create a problem first
    const currentProblem = await this.problemService.createProblem({
      ...problem,
      equipmentId,
      userId: session.user.id,
      businessId: session.business.id,
    });
    if (!currentProblem) {
      throw new Error('Failed to create problem');
    }
    const extendedSolution = Object.assign({}, solution, {problemId: currentProblem.id});
    let newSolution = null;
    if (solution) {
      newSolution = await this.solutionService.create(
        extendedSolution,
        session.user.id,
        session.business.id
      );
    }

    // Create the issue
    const issue = this.issueRepository.create({
      openedBy: session.user,
      business: session.business,
      equipment: { id: equipmentId },
      problem: currentProblem,
      solution: newSolution,
      status: 'open',
    });

    const savedIssue = await this.issueRepository.save(issue);

    // Link the session to the issue
    session.issue = savedIssue;
    await this.chatSessionRepository.save(session);

    return savedIssue;
  }

  async analyzeIssue(sessionId: number, issueId: number): Promise<void> {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['issue', 'issue.equipment', 'issue.problem'],
    });

    if (!session?.issue) {
      throw new Error('No issue found for this session');
    }

    const language = session.metadata?.language || 'en';

    // Get previous issues for this equipment
    const previousIssues = await this.issueRepository.find({
      where: { equipment: { id: session.issue.equipment.id } },
      relations: ['problem', 'solution'],
      take: 5,
      order: { createdAt: 'DESC' },
    });

    // Analyze the problem using AI
    const analysis = await this.aiService.analyzeProblem(
      session.issue.problem.description,
      session.issue.equipment,
      previousIssues,
      language
    );

    // Update the issue with AI analysis
    await this.issueRepository.save({
      id: issueId,
      aiAnalysis: analysis,
    });

    // Add AI analysis message to chat
    await this.addMessage(
      sessionId,
      this.formatAnalysisMessage(analysis, language),
      'ai',
      analysis
    );

    // If no dtos is needed, generate solutions
    if (!analysis.requiresTechnician) {
      const solutions = await this.aiService.generateSolution(
        session.issue.problem.description,
        analysis,
        session.issue.equipment,
        language
      );

      // Update the problem with the solutions
      await this.problemRepository.save({
        id: session.issue.problem.id,
        possibleSolutions: solutions,
      });

      // Add solutions message to chat
      await this.addMessage(
        sessionId,
        this.formatSolutionsMessage(solutions as string[], language),
        'ai',
        { solutions }
      );
    } else {
      // Update issue status for dtos
      await this.issueRepository.save({
        id: issueId,
        status: 'pending_technician',
      });

      // Add dtos message to chat
      const technicianMessage = language === 'he'
        ? 'תבסס על הניתוח, בעיה זו דורשת טכנאי מקצועי. האם תרצה שאעזור לך למצוא טכנאי מוסמך?'
        : 'Based on the analysis, this issue requires a professional dtos. Would you like me to help you find a qualified dtos?';

      await this.addMessage(
        sessionId,
        technicianMessage,
        'system'
      );
    }
  }

  private formatAnalysisMessage(analysis: any, language = 'en'): string {
    if (language === 'he') {
      return `🔍 ניתוח הבעיה:\n\n${analysis.summary}\n\n${analysis.recommendation}`;
    }
    return `🔍 Problem Analysis:\n\n${analysis.summary}\n\n${analysis.recommendation}`;
  }

  private formatSolutionsMessage(solutions: string[], language = 'en'): string {
    if (language === 'he') {
      let message = '📝 הנה הפתרונות צעד אחר צעד:\n\n';
      solutions.forEach((solution, index) => {
        message += `${index + 1}. ${solution}\n`;
      });
      message += '\nהאם תרצה לנסות את הפתרונות האלה? אשמח להסביר כל שלב בפירוט.';
      return message;
    } else {
      let message = '📝 Here are the step-by-step solutions:\n\n';
      solutions.forEach((solution, index) => {
        message += `${index + 1}. ${solution}\n`;
      });
      message += '\nWould you like to try these solutions? Let me know if you need any clarification on any step.';
      return message;
    }
  }
}
