import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { BusinessesService } from '../services/businesses.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly businessesService: BusinessesService,
  ) {}

  @Post('signup')
  async signUp(@Body() data: { admin: any; businesses: any[] }) {
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
