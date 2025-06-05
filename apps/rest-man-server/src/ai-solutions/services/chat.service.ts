import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from '../entities/chat-session.entity';
import { ChatMessage } from '../entities/chat-message.entity';
import { Issue } from '../entities/issue.entity';
import { Equipment } from '../../entities/equipment.entity';
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
    followUpQuestions:Record<string, string>[] = [],
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
      followUpQuestions,
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

  /**
   * Gets a chat session with all relations loaded
   */
  async getSessionWithRelations(sessionId: number): Promise<ChatSession> {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['issue', 'issue.equipment', 'issue.problem', 'issue.solution']
    });

    if (!session) {
      throw new Error(`Chat session with ID ${sessionId} not found`);
    }

    return session;
  }

  /**
   * Gets all user messages for a session
   */
  async getUserMessages(sessionId: number): Promise<ChatMessage[]> {
    const messages = await this.chatMessageRepository.find({
      where: {
        session: { id: sessionId },
        type: 'user'
      },
      order: { createdAt: 'ASC' }
    });

    return messages;
  }

  /**
   * Analyzes the issue for a session
   */
  async analyzeIssue(sessionId: number, issueId?: number): Promise<any> {
    const session = await this.getSessionWithRelations(sessionId);

    if (!issueId && session.issue) {
      issueId = session.issue.id;
    }

    if (!session?.issue?.equipment) {
      throw new Error('No equipment found for this session');
    }

    const language = session.metadata?.language || 'en';

    // Get user messages to analyze
    const userMessages = await this.getUserMessages(sessionId);
    const combinedText = userMessages.map(msg => msg.content).join('\n');

    // Get follow-up questions from the AI service
    const followUpQuestions = await this.aiService.generateFollowUpQuestions(
      combinedText,
      session.issue.equipment,
      language
    );

    // Find similar problems
    const problems = await this.problemService.findSimilarProblems(
      combinedText,
      session.issue.equipment.id,
      session.issue.equipment.businessId
    );

    // If this session doesn't have an issue yet, create one
    if (!session.issue && session.issue.equipment) {
      const issue = await this.issueRepository.save({
        session: { id: sessionId },
        equipment: { id: session.issue.equipment.id },
        problem: { description: combinedText },
        status: 'open',
        createdAt: new Date()
      });

      // Update the session with the issue
      await this.chatSessionRepository.update(sessionId, {
        issue: { id: issue.id }
      });
    }

    // If no additional questions, generate an enhanced diagnosis
    if (followUpQuestions.length === 0) {
      const enhancedDiagnosis = await this.aiService.enhancedDiagnosis(
        combinedText,
        session.issue.equipment,
        language
      );

      // If no technician is needed, generate solutions
      if (!enhancedDiagnosis.structuredData?.requiresTechnician) {
        // Future implementation for solutions
      }

      return {
        problems,
        followUpQuestions: [],
        confidence: enhancedDiagnosis.confidence,
        isDiagnosisReady: true
      };
    }

    return {
      problems,
      followUpQuestions,
      confidence: 'medium',
      isDiagnosisReady: false
    };
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

  /**
   * Adds a user's answer to a follow-up question
   */
  async addFollowUpAnswer(
    sessionId: number,
    questionType: string,
    answer: string
  ): Promise<void> {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId }
    });

    if (!session) {
      throw new Error(`Chat session with ID ${sessionId} not found`);
    }

    // Initialize metadata if needed
    const metadata = session.metadata || {};

    // Initialize answers array if needed
    metadata.followUpAnswers = metadata.followUpAnswers || [];

    // Add the answer with question type and timestamp
    metadata.followUpAnswers.push({
      questionType,
      answer,
      timestamp: new Date().toISOString()
    });

    // Update the session metadata
    await this.chatSessionRepository.update(sessionId, {
      metadata
    });
  }

  /**
   * Updates the session with the current follow-up question
   */
  async setCurrentFollowUpQuestion(
    sessionId: number,
    question: any // Changed type to any to avoid type conflicts
  ): Promise<void> {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId }
    });

    if (!session) {
      throw new Error(`Chat session with ID ${sessionId} not found`);
    }

    // Initialize metadata if needed
    const metadata = session.metadata || {};

    // Set the current follow-up question (storing it as a plain object)
    metadata.currentFollowUpQuestion = {
      question: question.question,
      type: question.type,
      options: question.options,
      context: question.context
    };

    // Update the session metadata
    await this.chatSessionRepository.update(sessionId, {
      metadata
    });
  }
}
