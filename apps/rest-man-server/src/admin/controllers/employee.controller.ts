// src/employees/employees.controller.ts
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post
} from '@nestjs/common';
import { EmployeesService } from '../services/employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get(':businessId')
  async findAllByBusiness(@Param('businessId') businessId: number) {
    return this.employeesService.findAllByBusiness(businessId);
  }
  @Post('associate')
  async associateUsersWithBusiness(@Body() body: { businessId: number; userIds: number[] }) {
    try {
      return await this.employeesService.associateUsersWithBusiness(body.businessId, body.userIds);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
