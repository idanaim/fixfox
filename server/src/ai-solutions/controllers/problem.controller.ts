import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProblemService } from '../services/problem.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../admin/entities/user.entity';
import { CreateProblemDto } from '../dtos/create-problem.dto';

@Controller('problems')
export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}

  /**
   * Direct creation of a problem record
   * This is used for administrative purposes outside of the chat flow
   */
  @Post()
  async createProblem(@Body() body: { user: User; problem: CreateProblemDto }) {
    return this.problemService.createProblem({
      ...body.problem,
      userId: body.user.id,
    });
  }

  /**
   * Associate a problem with specific equipment
   */
  @Put(':id/equipment/:equipmentId')
  async linkProblemToEquipment(
    @Param('id') id: number,
    @Param('equipmentId') equipmentId: number
  ) {
    return this.problemService.linkProblemToEquipment(id, equipmentId);
  }

  /**
   * Retrieve a specific problem with its solutions
   */
  @Get(':id')
  async getProblemWithSolutions(@Param('id') id: number) {
    return this.problemService.getProblemWithSolutions(id);
  }

  /**
   * Get all problems for a specific equipment
   */
  @Get()
  async getProblemsByEquipment(
    @Query('equipmentId') equipmentId: number,
    @Query('businessId') businessId: number
  ) {
    return this.problemService.getProblemsByEquipment(equipmentId, businessId);
  }

  /**
   * Find similar problems - for direct API integrations rather than chat flow
   */
  @Get('similar')
  async findSimilarProblems(
    @Query('description') description: string,
    @Query('equipmentId') equipmentId: number,
    @Query('businessId') businessId: number
  ) {
    return this.problemService.findSimilarProblems(
      description,
      equipmentId,
      businessId
    );
  }

  /**
   * API endpoint for direct diagnosis requests
   * @deprecated Use the chat flow instead via /chat/sessions/:sessionId/diagnose
   */
  @Post('diagnose')
  async diagnoseProblem(
    @Body()
    data: {
      description: string;
      equipmentId: number;
      businessId: number;
    }
  ) {
    return this.problemService.diagnoseProblem(
      data.description,
      data.equipmentId,
      data.businessId
    );
  }

  /**
   * API endpoint for direct enhanced diagnosis requests
   * @deprecated Use the chat flow instead via /chat/sessions/:sessionId/enhanced-diagnosis
   */
  @Post('enhanced-diagnosis')
  async enhancedDiagnosis(
    @Body()
    data: {
      description: string;
      equipmentId: number;
      businessId: number;
      maxResults?: number;
    }
  ) {
    return this.problemService.enhancedDiagnosis(
      data.description,
      data.equipmentId,
      data.businessId,
      data.maxResults || 5
    );
  }

  /**
   * Enhance a problem description using AI - direct API access
   * @deprecated Use the chat flow instead via /chat/sessions/:sessionId/enhance-description
   */
  // @Post('enhance-description')
  // async enhanceDescription(
  //   @Body() data: {
  //     description: string;
  //     equipmentId: number;
  //   }
  // ): Promise<{ originalDescription: string; enhancedDescription: string }> {
  //
  //   const enhancedDescription = await this.problemService.enhanceProblemDescription(
  //     data.description,
  //     data.equipmentId
  //   );
  //
  //   return {
  //     originalDescription: data.description,
  //     enhancedDescription
  //   };
  // }
}
