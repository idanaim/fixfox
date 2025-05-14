// import { EmployeeUser } from '../schemas/employee.schema';
// import { Business } from '../schemas/business.schema';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Injectable } from '@nestjs/common';
//
// @Injectable()
// export class EmployeeService {
//   constructor(
//     @InjectModel(EmployeeUser.name) private employeeModel: Model<EmployeeUser>,
//     @InjectModel(Business.name) private businessModel: Model<Business>,
//   ) {}
//
//   async registerEmployee(employeeDto: any) {
//     const { name, email, password, businessId } = employeeDto;
//
//     // Validate business ID
//     const business = await this.businessModel.findOne({ businessId });
//     if (!business) {
//       throw new Error('Invalid business ID');
//     }
//
//     // Create employee user
//     const hashedPassword = await this.hashPassword(password);
//     const employee = await this.employeeModel.create({
//       name,
//       email,
//       password: hashedPassword,
//       business: business._id,
//     });
//
//     return { message: 'Employee registered successfully', employee };
//   }
//
//   private async hashPassword(password: string): Promise<string> {
//     // Implement bcrypt hashing here
//     return 'hashed_password';
//   }
// }
