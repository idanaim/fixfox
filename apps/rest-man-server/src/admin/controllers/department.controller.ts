import { Controller, Get } from '@nestjs/common';
import { DepartmentDto, getDepartments } from '../dto/department.dto';

@Controller('departments')
export class DepartmentController {
  @Get()
  getDepartments(): DepartmentDto[] {
    return getDepartments();
  }
}
