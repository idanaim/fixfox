import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './services/users.service';
import { BusinessesService } from './services/businesses.service';
// import { WizardController } from './controllers/wizard.controller';
import { User } from './entities/user.entity';
import { Business } from './entities/business.entity';
import { Permissions } from './entities/permissions.entity';
import { UserBusiness } from './entities/user-business.entity';
import { BusinessesController } from './controllers/businesses.controller';
import { UserBusinessController } from './controllers/user-business.controller';
import { UserBusinessService } from './services/user-business.service';
import { UserController } from './controllers/users.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { PermissionsService } from './services/permissions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Business, Permissions, UserBusiness, ]),
  ],
  controllers: [ UserController, BusinessesController, UserBusinessController, PermissionsController],
  providers: [UsersService, BusinessesService, UserBusinessService, PermissionsService],
})
export class AdminModule {}
