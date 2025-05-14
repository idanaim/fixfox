import { Controller, Get, Param, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountsService } from '../services/accounts.service';
import { AccountSummaryDto } from '../DTO/account-summary.dto';

@Controller('accounts')
// @UseGuards(JwtAuthGuard)
export class AccountsController {
  private readonly logger = new Logger(AccountsController.name);

  constructor(private readonly accountsService: AccountsService) {}

  @Get(':accountId/summary')
  async getAccountSummary(@Param('accountId') accountId: string): Promise<AccountSummaryDto> {
    this.logger.log(`Fetching account summary for account ID: ${accountId}`);
    return this.accountsService.getAccountSummary(accountId);
  }
}
