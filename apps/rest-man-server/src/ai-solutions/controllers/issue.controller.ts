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
}
