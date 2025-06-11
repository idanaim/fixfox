import { Controller, Get } from '@nestjs/common';
import { DepartmentDto, getDepartments } from '../DTO/department.dto';

@Controller('departments')
export class DepartmentController {
  @Get()
  getDepartments(): DepartmentDto[] {
    return getDepartments();
  }
}
