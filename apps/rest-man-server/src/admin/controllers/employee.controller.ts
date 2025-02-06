// // src/employees/employees.controller.ts
// import { Controller, Get, Param } from '@nestjs/common';
// import { EmployeesService } from '../services/employees.service';
//
// @Controller('employees')
// export class EmployeesController {
//   constructor(private readonly employeesService: EmployeesService) {}
//
//   @Get(':businessId')
//   async findAllByBusiness(@Param('businessId') businessId: number) {
//     return this.employeesService.findAllByBusiness(businessId);
//   }
// }
