// import { Business } from '../schemas/business.schema';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Injectable } from '@nestjs/common';
//
// @Injectable()
// export class BusinessService {
//   constructor(
//     @InjectModel(Business.name) private businessModel: Model<Business>,
//   ) {}
//
//   async getBusinessInfo(businessId: string) {
//     const business = await this.businessModel.findOne({ businessId });
//     if (!business) {
//       throw new Error('Business not found');
//     }
//     return business;
//   }
// }
