import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserBusiness } from '../entities/user-business.entity';
import { Permissions } from '../entities/permissions.entity';
import { UpdateUserDto } from '../DTO/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserBusiness)
    private userBusinessRepository: Repository<UserBusiness>,
    @InjectRepository(Permissions)
    private readonly permissionsRepository: Repository<Permissions>
  ) {}

  async create(user: Partial<User>): Promise<User> {
    user.role = user.role || 'employee';
    const permissions = new Permissions();
    permissions.createTicket = user?.permissions?.createTicket || false;
    permissions.readTicket = user?.permissions?.readTicket || false;
    permissions.updateTicket = user?.permissions?.updateTicket || false;
    permissions.deleteTicket = user?.permissions?.deleteTicket || false;
    permissions.manageUsers = user?.permissions?.manageUsers || false;

    user.permissions = permissions;

    // Save the user (permissions will be saved automatically due to cascade)
    return this.usersRepository.save(user);
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      // Include relationships if needed (e.g., businesses the user belongs to)
      relations: ['businesses'],
    });
  }

  async findAllByAdmin(adminId: number): Promise<User[]> {
    return this.usersRepository.find({
      where: { adminId },
    });
  }

  async assignBusiness(userId: number, businessId: number): Promise<void> {
    const userBusiness = this.userBusinessRepository.create({
      user: { id: userId },
      business: { id: businessId },
    });
    await this.userBusinessRepository.save(userBusiness);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['permissions'], // Ensure permission is loaded
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Update user fields
    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.password) user.password = updateUserDto.password;
    if (updateUserDto.mobile) user.mobile = updateUserDto.mobile;
    if (updateUserDto.role) user.role = updateUserDto.role;

    // Update permissions if they exist in DTO
    if (updateUserDto.permissions && user.permissions) {
      const { permissions } = updateUserDto;

      if (typeof permissions.createTicket !== 'undefined') {
        user.permissions.createTicket = permissions.createTicket;
      }
      if (typeof permissions.readTicket !== 'undefined') {
        user.permissions.readTicket = permissions.readTicket;
      }
      if (typeof permissions.updateTicket !== 'undefined') {
        user.permissions.updateTicket = permissions.updateTicket;
      }
      if (typeof permissions.deleteTicket !== 'undefined') {
        user.permissions.deleteTicket = permissions.deleteTicket;
      }
      if (typeof permissions.manageUsers !== 'undefined') {
        user.permissions.manageUsers = permissions.manageUsers;
      }
    }

    await this.usersRepository.save(user);
    return this.usersRepository.findOne({
      where: { id },
      relations: ['permissions', 'businesses'], // Include relationships
    });
  }
}
