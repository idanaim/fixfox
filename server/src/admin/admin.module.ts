import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './services/users.service';
import { BusinessesService } from './services/businesses.service';
// import { WizardController } from './controllers/wizard.controller';
import { User } from './entities/user.entity';
import { Business } from './entities/business.entity';
import { UserBusiness } from './entities/user-business.entity';
import { BusinessesController } from './controllers/businesses.controller';
import { UserBusinessController } from './controllers/user-business.controller';
import { UserBusinessService } from './services/user-business.service';
import { UserController } from './controllers/users.controller';
// import { PermissionsController } from './controllers/permissions.controller';
// import { PermissionsService } from './services/permissions.service';
// import { EmployeesService } from './services/employees.service';
// import { EmployeesController } from './controllers/employee.controller';
import { Account } from './entities/account.entity';
import { AccountAdmin } from './entities/account-admin.entity';
import { EmployeesController } from './controllers/employee.controller';
import { EmployeesService } from './services/employees.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolesService } from './services/roles.service';
import { RolesController } from './controllers/roles.controller';
import { DepartmentController } from './controllers/department.controller';
import { AccountsController } from './controllers/accounts.controller';
import { AccountsService } from './services/accounts.service';
import { Issue } from '../ai-solutions/entities/issue.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Business,
      Permission,
      UserBusiness,
      Account,
      AccountAdmin,
      Role,
      Issue,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'fixfox-jwt-secret',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  exports: [
    UsersService,
    BusinessesService,
    UserBusinessService,
    EmployeesService,
    RolesService,
    AccountsService,
  ],
  controllers: [
    UserController,
    BusinessesController,
    UserBusinessController,
    EmployeesController,
    RolesController,
    DepartmentController,
    AccountsController,
  ],
  providers: [
    UsersService,
    BusinessesService,
    UserBusinessService,
    EmployeesService,
    RolesService,
    AccountsService,
  ],
})
export class AdminModule {}
