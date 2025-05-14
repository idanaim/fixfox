import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Account } from '../entities/account.entity';
import { Issue } from '../../ai-solutions/entities/issue.entity';
import { AccountSummaryDto } from '../DTO/account-summary.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>
  ) {}

  async getAccountSummary(accountId: string): Promise<AccountSummaryDto> {
    // Check if account exists
    const account = await this.accountRepository.findOne({
      where: { accountId },
      relations: ['businesses', 'users']
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }

    // Get count of open issues across all businesses for this account
    const businessIds = account.businesses.map(business => business.id);

    // Count open issues if there are businesses associated with the account
    let openIssuesCount = 0;
    if (businessIds.length > 0) {
      openIssuesCount = await this.issueRepository.count({
        where: {
          business: { id: In(businessIds) },
          status: 'open'
        }
      });
    }

    return {
      accountId: account.accountId,
      totalUsers: account.users.length,
      totalBusinesses: account.businesses.length,
      openIssuesCount
    };
  }
}
