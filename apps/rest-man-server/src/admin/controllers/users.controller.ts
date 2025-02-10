import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { BusinessesService } from '../services/businesses.service';
import { User } from '../entities/user.entity';
import { Business } from '../entities/business.entity';

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

  @Post('signup')
  async signUp(@Body() data: any) {
    const { admin, businesses } = data;

    // Create Admin
    const adminUser = await this.usersService.create({
      ...admin,
      role: 'admin',
    });

    // Create Businesses and Employees
    for (const businessData of businesses) {
      const business = await this.businessesService.create({
        ...businessData,
        admin: adminUser,
      });

      for (const employeeData of businessData.employees) {
        const employee = await this.usersService.create({
          ...employeeData,
          role: 'employee',
        });

        // Associate employee with business
        await this.usersService.assignBusiness(employee.id, business.id);
      }
    }

    return { message: 'Admin, businesses, and employees created successfully' };
  }

}
