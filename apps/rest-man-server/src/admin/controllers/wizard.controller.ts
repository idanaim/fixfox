// import { Body, Controller,Post } from '@nestjs/common';
// import { WizardDto } from '../DTO/admin-connections.dto';
// import { UsersService } from '../services/users.service';
// import { BusinessesService } from '../services/businesses.service';
//
// @Controller('signup')
// export class WizardController {
//   constructor(private readonly usersService: UsersService,
//               private readonly businessesService: BusinessesService) {}
//
//
//   @Post('wizard')
//   async handleWizard(@Body() wizardData: WizardDto) {
//     // Step 1: Create Admin User
//   debugger
//     const admin = await this.usersService.createUser({
//       ...wizardData.admin,
//       is_admin: true,
//     });
//
//     // Step 2: Create Businesses
//     const businessIds = [];
//     for (const business of wizardData.businesses) {
//       const createdBusiness = await this.businessesService.createBusiness(business);
//       businessIds.push(createdBusiness.id);
//     }
//
//     // Step 3: Create Users and Assign to Businesses
//     for (const user of wizardData.users) {
//       await this.usersService.createUser({
//         ...user,
//         business_id: businessIds[0], // Assign to the first business (or modify as needed)
//       });
//     }
//
//     return { message: 'Wizard completed successfully!' };
//   }
// }
