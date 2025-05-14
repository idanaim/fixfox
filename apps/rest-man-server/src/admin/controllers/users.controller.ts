import { Controller, Post, Body, Param, Get, Put, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { BusinessesService } from '../services/businesses.service';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../DTO/update-user.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserPermissionsDto } from '../DTO/user-permissions.dto';

@Controller('user')
// @UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly usersService: UsersService,
    private readonly businessesService: BusinessesService,
  ) {}

  @Get('all/:accountId')
  async findAllUserByAdminId(@Param('accountId') accountId: string): Promise<User[]> {
    return this.usersService.findAllByAdmin(accountId);
  }

  @Post(':accountId')
  async create(@Param('accountId') accountId: string, @Body() data: User) {
    debugger
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

  @Post('admin/signUp')
  async signUp(@Body() data: any) {
    const { admin, businesses, users } = data;
    // Create Admin
    const adminUser = await this.usersService.create({
      ...admin,
      role: 'admin',
    });

    // Create Businesses (no employees here)
    for (const businessData of businesses) {
      await this.businessesService.create({
        ...businessData,
        admin: adminUser, // Link business to admin
      });
    }

    // Create Employees (no businesses here)
    for (const employeeData of users) {
      await this.usersService.create({
        ...employeeData,
        role: employeeData.role || 'Employee',
        admin: adminUser, // Link employee to admin
      });
    }

    return { message: 'Admin, businesses, and employees created successfully' };
  }

  @Get(':userId/permissions')
  async getUserPermissions(@Param('userId') userId: string): Promise<UserPermissionsDto> {
    return this.usersService.getUserPermissions(parseInt(userId, 10));
  }
}
