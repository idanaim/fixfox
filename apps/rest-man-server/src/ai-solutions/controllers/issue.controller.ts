// issue.controller.ts
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { IssueService } from '../services/issue.service';

@Controller('issues')
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  @Post()
  async createIssue(
    @Body()
    createIssueDto: {
      businessId: number;
      userId: number;
      problemDescription: string;
      equipmentDescription: string;
    }
  ) {
    return this.issueService.createIssue(createIssueDto);
  }

  @Post('assign-technician')
  async createIssueWithTechnicianAssignment(
    @Body()
    createIssueDto: {
      businessId: number;
      userId: number;
      problemDescription: string;
      equipment?: any;
      language?: string;
    }
  ) {
    return this.issueService.createIssueWithTechnicianAssignment(createIssueDto);
  }

  @Post('resolved')
  async createResolvedIssue(
    @Body()
    createResolvedIssueDto: {
      businessId: number;
      userId: number;
      problemDescription: string;
      solutionId: number;
      equipment?: any;
      language?: string;
    }
  ) {
    return this.issueService.createResolvedIssue(createResolvedIssueDto);
  }

  /**
   * Get all issues for a specific business
   */
  @Get('business/:businessId')
  async getIssuesByBusiness(
    @Param('businessId') businessId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('equipmentId') equipmentId?: number,
    @Query('userId') userId?: number
  ) {
    return this.issueService.getIssuesByBusiness(businessId, {
      page: page ? parseInt(page.toString()) : undefined,
      limit: limit ? parseInt(limit.toString()) : undefined,
      status,
      equipmentId: equipmentId ? parseInt(equipmentId.toString()) : undefined,
      userId: userId ? parseInt(userId.toString()) : undefined
    });
  }

  /**
   * Get all issues for a specific user
   */
  @Get('user/:userId')
  async getIssuesByUser(
    @Param('userId') userId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('businessId') businessId?: number
  ) {
    return this.issueService.getIssuesByUser(userId, {
      page: page ? parseInt(page.toString()) : undefined,
      limit: limit ? parseInt(limit.toString()) : undefined,
      status,
      businessId: businessId ? parseInt(businessId.toString()) : undefined
    });
  }

  /**
   * Get a single issue by ID
   */
  @Get(':id')
  async getIssueById(
    @Param('id') id: number,
    @Query('businessId') businessId?: number
  ) {
    return this.issueService.getIssueById(id, businessId ? parseInt(businessId.toString()) : undefined);
  }

  /**
   * Get issue statistics for a business
   */
  @Get('business/:businessId/stats')
  async getIssueStats(@Param('businessId') businessId: number) {
    return this.issueService.getIssueStats(businessId);
  }

  /**
   * Update issue status
   */
  @Put(':id/status')
  async updateIssueStatus(
    @Param('id') id: number,
    @Body() body: { status: string; businessId?: number; userId?: number }
  ) {
    return this.issueService.updateIssueStatus(
      id,
      body.status,
      body.businessId,
      body.userId
    );
  }

  /**
   * Assign technician to issue
   */
  @Put(':id/assign')
  async assignTechnician(
    @Param('id') id: number,
    @Body() body: { technicianId: number; businessId?: number }
  ) {
    return this.issueService.assignTechnician(
      id,
      body.technicianId,
      body.businessId
    );
  }

  /**
   * Update issue cost
   */
  @Put(':id/cost')
  async updateIssueCost(
    @Param('id') id: number,
    @Body() body: { cost: number; businessId?: number }
  ) {
    return this.issueService.updateIssueCost(
      id,
      body.cost,
      body.businessId
    );
  }

  /**
   * Update issue treatment description
   */
  @Put(':id/treatment')
  async updateIssueTreatment(
    @Param('id') id: number,
    @Body() body: { treatment: string; businessId?: number; userId?: number }
  ) {
    return this.issueService.updateIssueTreatment(
      id,
      body.treatment,
      body.businessId,
      body.userId
    );
  }

  /**
   * Close issue with cost and treatment
   */
  @Put(':id/close')
  async closeIssue(
    @Param('id') id: number,
    @Body() body: { cost?: number; treatment?: string; businessId?: number; userId?: number }
  ) {
    return this.issueService.closeIssue(
      id,
      body.cost,
      body.treatment,
      body.businessId,
      body.userId
    );
  }

  /**
   * Comprehensive update for issue - handles status, cost, treatment, and closing
   */
  @Put(':id/update')
  async updateIssueComprehensive(
    @Param('id') id: number,
    @Body() body: {
      status?: string;
      cost?: number;
      treatment?: string;
      shouldClose?: boolean;
      businessId?: number;
      userId?: number;
    }
  ) {
    return this.issueService.updateIssueComprehensive(
      id,
      body.status,
      body.cost,
      body.treatment,
      body.shouldClose,
      body.businessId,
      body.userId
    );
  }
}
