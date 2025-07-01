import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CreateSolutionDto } from '../dtos/solution.dto';
import { CreateProblemDto } from '../dtos/create-problem.dto';
import { ProblemService } from '../services/problem.service';
import { Equipment } from '../../entities/equipment.entity';
import { AIService } from '../services/ai.service';

@Controller('chat')
// @UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly problemService: ProblemService,
    private readonly aiService: AIService
  ) {}

  @Post('sessions')
  async createSession(
    // @CurrentUser() user: User,
    @Body('userId') userId: number,
    @Body('businessId') businessId: number
  ) {
    return this.chatService.createSession(userId, businessId);
  }

  @Post('sessions/:sessionId/messages')
  async addMessage(
    @Param('sessionId') sessionId: number,
    @Body()
    body: { content: string; type: 'user' | 'system' | 'ai'; metadata?: any }
  ) {
    return this.chatService.addMessage(
      sessionId,
      body.content,
      body.type,
      body.metadata
    );
  }

  @Get('sessions/:sessionId/messages')
  async getSessionMessages(@Param('sessionId') sessionId: number) {
    return this.chatService.getSessionMessages(sessionId);
  }
  @Put('sessions/:sessionId/status')
  async updateSessionStatus(
    @Param('sessionId') sessionId: number,
    @Body() body: { status: string; metadata?: any }
  ) {
    return this.chatService.updateSessionStatus(
      sessionId,
      body.status,
      body.metadata
    );
  }

  @Post('sessions/:sessionId/enhance-description')
  async enhanceProblemDescription(
    @Param('sessionId') sessionId: number,
    @Body()
    body: {
      description: string;
      equipment: Equipment;
      language?: string;
      followUpQuestions?: Record<string, string>[];
    }
  ) {
    return this.chatService.enhanceProblemDescription(
      sessionId,
      body.description,
      body.equipment,
      body.followUpQuestions,
      body.language
    );
  }

  @Post('sessions/:sessionId/equipment-search')
  async findEquipment(
    @Param('sessionId') sessionId: number,
    @Body() body: { businessId: number; description: string }
  ) {
    return this.chatService.findEquipmentByDescription(
      body.businessId,
      body.description
    );
  }

  @Post('sessions/:sessionId/issues')
  async createIssue(
    @Param('sessionId') sessionId: number,
    @Body()
    body: {
      equipmentId: number;
      problem: CreateProblemDto;
      solution?: CreateSolutionDto;
    }
  ) {
    const issue = await this.chatService.createIssueFromSession(
      sessionId,
      body.equipmentId,
      body.problem,
      body.solution
    );

    // Trigger AI analysis after creating the issue
    await this.chatService.analyzeIssue(sessionId);

    return issue;
  }

  @Post('sessions/:sessionId/followup-questions')
  async analyzeIssue(
    @Param('sessionId') sessionId: number,
    @Body() body?: { language?: string; equipment: Equipment }
  ) {
    const language = body?.language || 'en';
    try {
      // Get user messages to analyze
      const userMessages = await this.chatService.getUserMessages(sessionId);
      // Generate follow-up questions based on the description and previous answers
      const combinedText = userMessages.map((msg) => msg.content).join('\n');
      const followUpQuestions = await this.aiService.generateFollowUpQuestions(
        combinedText,
        body.equipment,
        language
      );
      // If no questions, generate a summary of the information provided
      if (followUpQuestions.length === 0) {
        // Generate a summary of the collected information
        const summary = await this.aiService.generateIssueSummary(
          combinedText,
          body.equipment,
          language
        );

        // Return the summary without follow-up questions
        return {
          problems: [],
          followUpQuestions: [],
          confidence: 'high',
          summary: summary,
          isDiagnosisReady: true,
        };
      }
      // Return only the first question to implement step-by-step questioning
      return {
        problems: [],
        followUpQuestions,
        confidence: 'medium',
        isDiagnosisReady: false,
      };
    } catch (error) {
      console.error('Error analyzing issue:', error);
      throw error;
    }
  }

  @Post('sessions/:sessionId/diagnose')
  async diagnoseProblem(
    @Param('sessionId') sessionId: number,
    @Body()
    body: {
      description: string;
      equipmentId: number;
      businessId: number;
      language?: string;
      skipSimilar?: boolean;
    }
  ) {
    // Add a message indicating we're diagnosing the problem
    const diagnosingMessage =
      body.language === 'he'
        ? 'מאבחן את הבעיה...'
        : 'Diagnosing the problem...';

    await this.chatService.addMessage(sessionId, diagnosingMessage, 'system', {
      language: body.language,
    });

    // Get diagnosis from problem service
    const diagnosis = await this.problemService.diagnoseProblem(
      body.description,
      body.equipmentId,
      body.businessId,
      body.language,
      body.skipSimilar
    );

    // Add the diagnosis result as a message
    await this.chatService.addMessage(sessionId, diagnosis.message, 'system', {
      language: body.language,
    });

    return diagnosis;
  }

  @Post('sessions/:sessionId/enhanced-diagnosis')
  async enhancedDiagnosis(
    @Param('sessionId') sessionId: number,
    @Body()
    data: {
      description: string;
      equipmentId: number;
      businessId: number;
      maxResults?: number;
      language?: string;
    }
  ) {
    const language = data.language || 'en';
    const enhancedDiagnosisMessage =
      language === 'he'
        ? `מבצע אבחון מתקדם עבור ציוד מספר ${data.equipmentId}...`
        : `Performing enhanced diagnosis for equipment ID ${data.equipmentId}...`;

    // Record the enhanced diagnosis attempt
    await this.chatService.addMessage(
      sessionId,
      enhancedDiagnosisMessage,
      'system',
      { language }
    );

    // Use ProblemService for the enhanced diagnosis
    const diagnosisResult = await this.problemService.enhancedDiagnosis(
      data.description,
      data.equipmentId,
      data.businessId,
      data.maxResults || 5,
      language
    );

    // Update the chat session with the results
    await this.chatService.updateSessionStatus(
      sessionId,
      'enhanced_diagnosis_complete',
      {
        enhancedDiagnosisResult: diagnosisResult,
        language,
      }
    );

    return diagnosisResult;
  }

  // New endpoints for the 12-step flow
  @Get('sessions/:sessionId/open-issues')
  async getOpenIssues(
    @Param('sessionId') sessionId: number,
    @Query('equipmentId') equipmentId: number,
    @Query('businessId') businessId: number,
    @Query('language') language?: string
  ) {
    try {
      const openIssues = await this.chatService.getOpenIssuesByEquipment(
        equipmentId,
        businessId
      );

      // Add a message to the chat about the open issues
      const message = language === 'he'
        ? `נמצאו ${openIssues.length} תקלות פתוחות לציוד זה`
        : `Found ${openIssues.length} open issues for this equipment`;

      await this.chatService.addMessage(sessionId, message, 'system', {
        language,
        openIssues
      });

      return openIssues;
    } catch (error) {
      console.error('Error getting open issues:', error);
      throw error;
    }
  }

  @Post('sessions/:sessionId/similar-issues')
  async checkSimilarIssues(
    @Param('sessionId') sessionId: number,
    @Body()
    body: {
      description: string;
      equipmentId: number;
      businessId: number;
      language?: string;
    }
  ) {
    const language = body.language || 'en';
    
    try {
      const similarIssues = await this.chatService.findSimilarIssuesInBusiness(
        body.description,
        body.equipmentId,
        body.businessId
      );

      // Log the check
      await this.chatService.addMessage(
        sessionId,
        language === 'he' 
          ? 'בודק בעיות דומות בעסק שלך...'
          : 'Checking for similar issues in your business...',
        'system',
        { language, step: 'checking_similar_issues' }
      );

      return similarIssues;
    } catch (error) {
      console.error('Error checking similar issues:', error);
      return [];
    }
  }

  @Post('sessions/:sessionId/matching-problems')
  async getMatchingProblems(
    @Param('sessionId') sessionId: number,
    @Body()
    body: {
      description: string;
      equipmentId: number;
      businessId: number;
      language?: string;
    }
  ) {
    const language = body.language || 'en';
    
    try {
      const matchingProblems = await this.chatService.findMatchingProblemsFromOtherBusinesses(
        body.description,
        body.equipmentId,
        body.businessId
      );

      // Log the search
      await this.chatService.addMessage(
        sessionId,
        language === 'he' 
          ? 'מחפש פתרונות מעסקים אחרים...'
          : 'Searching for solutions from other businesses...',
        'system',
        { language, step: 'matching_solutions' }
      );

      return matchingProblems;
    } catch (error) {
      console.error('Error getting matching problems:', error);
      return [];
    }
  }

  @Post('sessions/:sessionId/solution-success')
  async saveSolutionSuccess(
    @Param('sessionId') sessionId: number,
    @Body()
    body: {
      solutionText: string;
      equipmentId: number;
      businessId: number;
      language?: string;
    }
  ) {
    const language = body.language || 'en';
    
    try {
      const result = await this.chatService.recordSolutionSuccess(
        sessionId,
        body.solutionText,
        body.equipmentId,
        body.businessId
      );

      // Log the success
      await this.chatService.addMessage(
        sessionId,
        language === 'he' 
          ? 'הפתרון עבד! שומר את הפתרון לעתיד...'
          : 'Solution worked! Saving solution for future use...',
        'system',
        { language, step: 'solution_feedback' }
      );

      return result;
    } catch (error) {
      console.error('Error saving solution success:', error);
      throw error;
    }
  }

  @Post('sessions/:sessionId/new-problem-solution')
  async createNewProblemSolution(
    @Param('sessionId') sessionId: number,
    @Body()
    body: {
      problemData: {
        description: string;
        equipmentId: number;
        businessId: number;
        userId: number;
      };
      solutionData: {
        treatment: string;
        effectiveness: number;
        resolvedBy: string;
      };
      language?: string;
    }
  ) {
    const language = body.language || 'en';
    
    try {
      const result = await this.chatService.createNewProblemWithSolution(
        sessionId,
        body.problemData,
        body.solutionData
      );

      // Log the creation
      await this.chatService.addMessage(
        sessionId,
        language === 'he' 
          ? 'יצר בעיה חדשה ופתרון במאגר הידע'
          : 'Created new problem and solution in knowledge base',
        'system',
        { language, step: 'ai_solution_testing' }
      );

      return result;
    } catch (error) {
      console.error('Error creating new problem solution:', error);
      throw error;
    }
  }

  @Post('sessions/:sessionId/enhanced-description')
  async createEnhancedDescription(
    @Param('sessionId') sessionId: number,
    @Body()
    body: {
      description: string;
      equipment: any;
      triedSolutions: string[];
      language?: string;
    }
  ) {
    const language = body.language || 'en';
    
    try {
      const enhancedDescription = await this.chatService.generateEnhancedDescriptionForTechnician(
        body.description,
        body.equipment,
        body.triedSolutions,
        language
      );

      return { enhancedDescription };
    } catch (error) {
      console.error('Error creating enhanced description:', error);
      throw error;
    }
  }

  @Post('sessions/:sessionId/assign-technician')
  async assignToTechnician(
    @Param('sessionId') sessionId: number,
    @Body()
    body: {
      equipmentId: number;
      businessId: number;
      description: string;
      triedSolutions: string[];
      priority: string;
      language?: string;
    }
  ) {
    const language = body.language || 'en';
    
    try {
      const assignment = await this.chatService.assignIssueToTechnician(
        sessionId,
        body.equipmentId,
        body.businessId,
        body.description,
        body.triedSolutions,
        body.priority
      );

      // Log the assignment
      await this.chatService.addMessage(
        sessionId,
        language === 'he' 
          ? 'הבעיה הועברה לטכנאי עם תיאור מפורט'
          : 'Issue assigned to technician with detailed description',
        'system',
        { language, step: 'technician_assignment' }
      );

      return assignment;
    } catch (error) {
      console.error('Error assigning to technician:', error);
      throw error;
    }
  }
}
