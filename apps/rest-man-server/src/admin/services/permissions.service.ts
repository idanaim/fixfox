// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Permission } from '../entities/permission.entity';
//
// @Injectable()
// export class PermissionsService {
//   constructor(
//     @InjectRepository(Permission)
//     private permissionsRepository: Repository<Permission>,
//   ) {}
//
//   async createPermission(action: string): Promise<Permission> {
//     const permission = this.permissionsRepository.create({ action });
//     return this.permissionsRepository.save(permission);
//   }
//
//   async findAllPermissions(): Promise<Permission[]> {
//     return this.permissionsRepository.find();
//   }
// }
