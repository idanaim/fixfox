// issue.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
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
}
