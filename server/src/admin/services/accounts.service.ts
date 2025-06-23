import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Account } from '../entities/account.entity';
import { User } from '../entities/user.entity';
import { Business } from '../entities/business.entity';
import { AccountAdmin } from '../entities/account-admin.entity';
import { Issue } from '../../ai-solutions/entities/issue.entity';
import { AccountSummaryDto } from '../dto/account-summary.dto';
import { OnboardingDto } from '../dto/onboarding.dto';
import { UserRole } from '../enums/role.enum';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(AccountAdmin)
    private accountAdminRepository: Repository<AccountAdmin>,
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
    private dataSource: DataSource,
    private jwtService: JwtService
  ) {
  }

  async onboarding(onboardingDto: OnboardingDto) {
    // Check if admin email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: onboardingDto.admin.email }
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    // Use transaction to ensure all operations succeed or fail together
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create account
      const account = this.accountRepository.create({
        name: onboardingDto.account.name
      });
      const savedAccount = await queryRunner.manager.save(account);

      // 2. Create admin user
      const hashedPassword = await bcrypt.hash(onboardingDto.admin.password || '12345', 10);
      const adminUser = this.userRepository.create({
        name: `${onboardingDto.admin.firstName} ${onboardingDto.admin.lastName}`,
        email: onboardingDto.admin.email,
        password: hashedPassword,
        mobile: onboardingDto.admin.mobile,
        role: UserRole.ADMIN,
        accountId: savedAccount.accountId
      });
      const savedAdminUser = await queryRunner.manager.save(adminUser);

      // 3. Create account_admin record
      const accountAdmin = this.accountAdminRepository.create({
        accountId: savedAccount.accountId,
        userId: savedAdminUser.id
      });
      await queryRunner.manager.save(accountAdmin);

      // 4. Create business
      const business = this.businessRepository.create({
        name: onboardingDto.business.name,
        type: onboardingDto.business.type,
        address: onboardingDto.business.address || null,
        mobile: onboardingDto.business.phone,
        accountId: savedAccount.accountId
      });
      const savedBusiness = await queryRunner.manager.save(business);

      // 5. Create team members if any
      const savedTeamMembers = [];
      if (onboardingDto.teamMembers && onboardingDto.teamMembers.length > 0) {
        for (const member of onboardingDto.teamMembers) {
          const memberHashedPassword = await bcrypt.hash('12345678abc', 10); // Default password
          const teamMember = this.userRepository.create({
            name: `${member.firstName} ${member.lastName}`,
            email: member.email,
            password: memberHashedPassword,
            mobile: member.mobile,
            role: UserRole[member.role] || UserRole.TEAM_MEMBER,
            accountId: savedAccount.accountId
          });
          const savedMember = await queryRunner.manager.save(teamMember);
          savedTeamMembers.push(savedMember);
        }
      }

      await queryRunner.commitTransaction();

      // Generate JWT token for the admin user
      const payload = {
        sub: savedAdminUser.id,
        email: savedAdminUser.email,
        role: savedAdminUser.role,
        accountId: savedAccount.accountId
      };
      const token = this.jwtService.sign(payload);

      // Return success response with token and created entities
      return {
        success: true,
        token,
        accountId: savedAccount.accountId,
        user: {
          id: savedAdminUser.id,
          name: savedAdminUser.name,
          email: savedAdminUser.email,
          role: savedAdminUser.role
        },
        businessId: savedBusiness.id
      };
    } catch (error) {
      // If any operation fails, roll back the entire transaction
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

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
