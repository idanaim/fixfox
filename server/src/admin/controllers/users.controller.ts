import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { BusinessesService } from '../services/businesses.service';
import { User } from '../entities/user.entity';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserPermissionsDto } from '../dto/user-permissions.dto';

@Controller('user')
// @UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly usersService: UsersService,
    private readonly businessesService: BusinessesService
  ) {}

  @Get('all/:accountId')
  async findAllUserByAdminId(
    @Param('accountId') accountId: string
  ): Promise<User[]> {
    return this.usersService.findAllByAdmin(accountId);
  }

  @Get('business/:businessId')
  async findUsersByBusiness(
    @Param('businessId') businessId: string
  ): Promise<User[]> {
    return this.usersService.findByBusiness(parseInt(businessId, 10));
  }

  @Post(':accountId')
  async create(@Param('accountId') accountId: string, @Body() data: User) {
    data.accountId = accountId;
    return this.usersService.create(data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(parseInt(id, 10));
    if (!user) {
      return { message: 'User not found' };
    }
    return user;
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(parseInt(id, 10), updateUserDto);
  }

  @Get(':userId/permissions')
  async getUserPermissions(
    @Param('userId') userId: string
  ): Promise<UserPermissionsDto> {
    return this.usersService.getUserPermissions(parseInt(userId, 10));
  }
}
