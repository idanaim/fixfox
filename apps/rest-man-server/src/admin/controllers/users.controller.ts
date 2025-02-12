import { Controller, Post, Body, Param, Get, Put } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { BusinessesService } from '../services/businesses.service';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../DTO/update-user.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly usersService: UsersService,
    private readonly businessesService: BusinessesService,
  ) {}

  @Get('all/:adminId')
  async findAllUserByAdminId(@Param('adminId') adminId: number): Promise<User[]> {
    return this.usersService.findAllByAdmin(adminId);
  }

  @Post(':adminId')
  async create(@Param('adminId') adminId: number,@Body() data: User) {
    data.adminId = adminId;
    return this.usersService.create(data);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      return { message: 'User not found' };
    }
    return user;
  }
  @Put(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Post('admin/signUp')
  async signUp(@Body() data: any) {
debugger
    const { admin, businesses, users } = data;
    debugger
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
    debugger
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

}
