// src/user-business/user-business.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { UserBusinessService } from '../services/user-business.service';

@Controller('user-business')
export class UserBusinessController {
  constructor(private readonly userBusinessService: UserBusinessService) {}

  @Get('users/:adminId')
  async findUsersByAdmin(@Param('adminId') adminId: number) {
    return this.userBusinessService.findUsersByAdmin(adminId);
  }
}
