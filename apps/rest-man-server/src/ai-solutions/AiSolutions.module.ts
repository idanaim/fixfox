import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solution } from './entities/solution.entity';
import { SolutionService } from './services/solution.service';
import { AdminModule } from '../admin/admin.module';
import { IssueController } from './controllers/issue.controller';
import { Issue } from './entities/issue.entity';
import { Problem } from './entities/problem.entity';
import { Equipment } from './entities/equipment.entity';
import { ProblemService } from './services/problem.service';
import { IssueService } from './services/issue.service';
import { EquipmentService } from './services/equipment.service';
import { Business } from '../admin/entities/business.entity';
import { ProblemController } from './controllers/problem.controller';
import { ChatModule } from './chat.module';
import { SolutionController } from './controllers/solution.controller';

@Module({
  imports: [
    AdminModule,
    ChatModule,
    TypeOrmModule.forFeature([Solution, Problem, Equipment, Issue, Business]),
  ],
  controllers: [IssueController, ProblemController, SolutionController],
  providers: [SolutionService, ProblemService, IssueService, EquipmentService],
})
export class AiSolutionsModule {}
