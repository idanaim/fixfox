import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { RoleDto } from '../DTO/role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<RoleDto[]> {
    const roles = await this.rolesRepository.find();

    return roles.map(role => ({
      id: role.roleId,
      name: role.roleName,
      description: role.description,
    }));
  }
}
