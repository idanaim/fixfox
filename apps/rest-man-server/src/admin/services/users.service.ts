import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserBusiness } from '../entities/user-business.entity';
import { UpdateUserDto } from '../DTO/update-user.dto';
import { Role } from '../entities/role.entity';
import { UserPermissionsDto } from '../DTO/user-permissions.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserBusiness)
    private userBusinessRepository: Repository<UserBusiness>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>
  ) {}

  async create(user: Partial<User>): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = this.usersRepository.create({
      ...user,
      password: hashedPassword,
    });
    return this.usersRepository.save(newUser);
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['businesses'],
    });
  }

  async findAllByAdmin(accountId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { accountId },
      relations: ['businesses'],
    });
  }

  async assignBusiness(userId: number, businessId: number): Promise<void> {
    const userBusiness = this.userBusinessRepository.create({
      user: { id: userId },
      business: { id: businessId },
    });
    await this.userBusinessRepository.save(userBusiness);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { email }
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.password) user.password = updateUserDto.password;
    if (updateUserDto.mobile) user.mobile = updateUserDto.mobile;
    if (updateUserDto.role) user.role = updateUserDto.role;
    if (updateUserDto.department !== undefined) user.department = updateUserDto.department;
    if (updateUserDto.departments !== undefined) user.departments = updateUserDto.departments;
    if (updateUserDto.positionTitle !== undefined) user.positionTitle = updateUserDto.positionTitle;

    await this.usersRepository.save(user);
    return this.usersRepository.findOne({
      where: { id },
      relations: ['permissions', 'businesses'],
    });
  }

  async getUserPermissions(userId: number): Promise<UserPermissionsDto> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      return {
        userId: userId.toString(),
        role: null,
        permissions: [],
      };
    }

    const role = await this.rolesRepository
      .createQueryBuilder('role')
      .where('role.roleId = :roleId', { roleId: user.role })
      .leftJoinAndSelect('role.permissions', 'permissions')
      .getOne();

    if (!role) {
      return {
        userId: userId.toString(),
        role: user.role,
        permissions: [],
      };
    }

    return {
      userId: userId.toString(),
      role: role.roleName,
      permissions: role.permissions.map((permission) => permission.permission),
    };
  }
}
