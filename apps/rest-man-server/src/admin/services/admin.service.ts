import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminUser, AdminUserDoc } from '../schemas/admin-user.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(AdminUser.name) private adminUserModel: Model<AdminUserDoc>,
  ) {}

  async registerAdmin(adminDto: any): Promise<AdminUser> {
    // Check if email already exists
    const existingAdmin = await this.adminUserModel.findOne({
      email: adminDto.email,
    });

    if (existingAdmin) {
      throw new Error('Admin with this email already exists.');
    }

    const newAdmin = new this.adminUserModel(adminDto);
    return newAdmin.save();
  }

  async findAllAdmins(): Promise<AdminUser[]> {
    return this.adminUserModel.find().populate('business').exec();
  }
}
