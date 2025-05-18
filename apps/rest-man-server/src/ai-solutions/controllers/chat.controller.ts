import { Body, Controller, Get, Param, Post, Put, UseGuards, NotFoundException } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../admin/entities/user.entity';
import { Problem } from '../entities/problem.entity';
import { Solution } from '../entities/solution.entity';
import { CreateSolutionDto } from '../dtos/solution.dto';
import { CreateProblemDto } from '../dtos/create-problem.dto';
import { ProblemService } from '../services/problem.service';
import { Equipment } from '../entities/equipment.entity';

@Controller('chat')
// @UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly problemService: ProblemService
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
    @Body() body: { content: string; type: 'user' | 'system' | 'ai'; metadata?: any }
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
    @Body() body: { description: string, equipment: Equipment, language?: string }
  ) {
    return this.chatService.enhanceProblemDescription(
      sessionId,
      body.description,
      body.equipment,
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
    @Body() body: { equipmentId: number; problem: CreateProblemDto, solution?: CreateSolutionDto }
  ) {
    const issue = await this.chatService.createIssueFromSession(
      sessionId,
      body.equipmentId,
      body.problem,
      body.solution
    );

    // Trigger AI analysis after creating the issue
    await this.chatService.analyzeIssue(sessionId, issue.id);

    return issue;
  }

  @Post('sessions/:sessionId/analyze')
  async analyzeIssue(
    @Param('sessionId') sessionId: number,
    @Body('issueId') issueId: number
  ) {
    return this.chatService.analyzeIssue(sessionId, issueId);
  }

  @Post('sessions/:sessionId/diagnose')
  async diagnoseProblem(
    @Param('sessionId') sessionId: number,
    @Body() body: { description: string; equipmentId: number; businessId: number; language?: string }
  ) {
    // Add a message indicating we're diagnosing the problem
    const diagnosingMessage = body.language === 'he'
      ? 'מאבחן את הבעיה...'
      : 'Diagnosing the problem...';

    await this.chatService.addMessage(
      sessionId,
      diagnosingMessage,
      'system',
      { language: body.language }
    );

    // Get diagnosis from problem service
    const diagnosis = await this.problemService.diagnoseProblem(
      body.description,
      body.equipmentId,
      body.businessId,
      body.language
    );

    // Add the diagnosis result as a message
    await this.chatService.addMessage(
      sessionId,
      diagnosis.message,
      'system',
      { language: body.language }
    );

    return diagnosis;
  }

  @Post('sessions/:sessionId/enhanced-diagnosis')
  async enhancedDiagnosis(
    @Param('sessionId') sessionId: number,
    @Body() data: {
      description: string;
      equipmentId: number;
      businessId: number;
      maxResults?: number;
      language?: string;
    }
  ) {
    const language = data.language || 'en';
    const enhancedDiagnosisMessage = language === 'he'
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
        language 
      }
    );

    return diagnosisResult;
  }
}
