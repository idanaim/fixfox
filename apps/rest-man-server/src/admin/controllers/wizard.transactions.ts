// import { EntityManager, Transaction, TransactionManager } from 'typeorm';
// import { User } from '../entities/user.entity';
// import { Post } from '@nestjs/common';
//
// @Post('wizard')
// @Transaction()
// async handleWizard(
//   @Body() wizardData: WizardDto,
// @TransactionManager() manager: EntityManager,
// ) {
//   try {
//     // Step 1: Create Admin User
//     const admin = await manager.getRepository(User).save({
//       ...wizardData.admin,
//       is_admin: true,
//     });
//     //
//     // Step 2: Create Businesses
//     const businessIds = [];
//     for (const business of wizardData.businesses) {
//       const createdBusiness = await manager.getRepository(Business).save(business);
//       businessIds.push(createdBusiness.id);
//     }
//
//     // Step 3: Create Users and Assign to Businesses
//     for (const user of wizardData.users) {
//       await manager.getRepository(User).save({
//         ...user,
//         business_id: businessIds[0], // Assign to the first business
//       });
//     }
//
//     return { message: 'Wizard completed successfully!' };
//   } catch (error) {
//     throw new Error('Failed to save wizard data');
//   }
// }
