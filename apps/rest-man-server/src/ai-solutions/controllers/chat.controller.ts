import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../admin/entities/user.entity';
import { Problem } from '../entities/problem.entity';
import { Solution } from '../entities/solution.entity';
import { CreateSolutionDto } from '../dtos/solution.dto';
import { CreateProblemDto } from '../dtos/create-problem.dto';
import { ProblemService } from '../services/problem.service';

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
    @Body() body: { description: string }
  ) {
    return this.chatService.enhanceProblemDescription(
      sessionId,
      body.description
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
    @Body() data: {
      description: string;
      equipmentId: number;
      businessId: number;
    }
  ) {
    // First record the diagnosis attempt in the chat
    await this.chatService.addMessage(
      sessionId,
      `Diagnosing problem for equipment ID ${data.equipmentId}`,
      'system'
    );
    // Use the ProblemService for the actual diagnosis
    const diagnosisResult = await this.problemService.enhancedDiagnosis(
      data.description,
      data.equipmentId,
      data.businessId
    );

    // Update the chat session with diagnosis details
    await this.chatService.updateSessionStatus(
      sessionId,
      'diagnosis_complete',
      { diagnosisResult }
    );

    return diagnosisResult;
  }

  @Post('sessions/:sessionId/enhanced-diagnosis')
  async enhancedDiagnosis(
    @Param('sessionId') sessionId: number,
    @Body() data: {
      description: string;
      equipmentId: number;
      businessId: number;
      maxResults?: number;
    }
  ) {
    // Record the enhanced diagnosis attempt
    await this.chatService.addMessage(
      sessionId,
      `Performing enhanced diagnosis for equipment ID ${data.equipmentId}`,
      'system'
    );

    // Use ProblemService for the enhanced diagnosis
    const diagnosisResult = await this.problemService.enhancedDiagnosis(
      data.description,
      data.equipmentId,
      data.businessId,
      data.maxResults || 5
    );

    // Update the chat session with the results
    await this.chatService.updateSessionStatus(
      sessionId,
      'enhanced_diagnosis_complete',
      { enhancedDiagnosisResult: diagnosisResult }
    );

    return diagnosisResult;
  }
}
