// src/permissions/permissions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { PermissionDto } from '../DTO/permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async updatePermissions(userId: number, permissionDto: PermissionDto): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({ where: { user: { id: userId } } });
debugger;
    if (!permission) {
      throw new NotFoundException('Permissions not found');
    }

    // Update fields
    Object.assign(permission, permissionDto);
    permission.updatedAt = new Date(); // Update timestamp

    return this.permissionRepository.save(permission);
  }

  async getPermissions(userId: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({ where: { user: { id: userId } } });

    if (!permission) {
      throw new NotFoundException('Permissions not found');
    }

    return permission;
  }
}
