// // src/permissions/permissions.service.ts
// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Permissions } from '../entities/permissions.entity';
// import { PermissionDto } from '../DTO/permission.dto';
//
// @Injectable()
// export class PermissionsService {
//   constructor(
//     @InjectRepository(Permissions)
//     private permissionRepository: Repository<Permissions>,
//   ) {}
//
//   async updatePermissions(userId: number, permissionDto: PermissionDto): Promise<Permissions> {
//     const permissions = await this.permissionRepository.findOne({ where: { user: { id: userId } } });
//     if (!permissions) {
//       throw new NotFoundException('Permissions not found');
//     }
//
//     // Update fields
//     Object.assign(permissions, permissionDto);
//     permissions.updatedAt = new Date(); // Update timestamp
//
//     return this.permissionRepository.save(permissions);
//   }
//
//   async getPermissions(userId: number): Promise<void> {
//   //   const permission = await this.permissionRepository.findOne({ where: { user: { id: userId } } });
//   //
//   //   if (!permission) {
//   //     throw new NotFoundException('Permissions not found');
//   //   }
//   //
//   //   return permission;
//   }
// }
