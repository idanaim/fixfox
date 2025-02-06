import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './services/users.service';
import { BusinessesService } from './services/businesses.service';
// import { WizardController } from './controllers/wizard.controller';
import { User } from './entities/user.entity';
import { Business } from './entities/business.entity';
import { Permission } from './entities/permission.entity';
// import { PermissionsController } from './controllers/permissions.controller';
// import { UsersController } from './controllers/users.controller';
// import { PermissionsService } from './services/permissions.service';
// import {BusinessesController} from './controllers/businesses.controller';
import { UserBusiness } from './entities/user-business.entity';
import { AdminController } from './controllers/admin.controller';
import { BusinessesController } from './controllers/businesses.controller';
import { UserBusinessController } from './controllers/user-business.controller';
import { UserBusinessService } from './services/user-business.service';
import { UserController } from './controllers/users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Business, Permission, UserBusiness]),
  ],
  controllers: [ UserController, BusinessesController, UserBusinessController],
  providers: [UsersService, BusinessesService, UserBusinessService],
})
export class AdminModule {}
