// import { Controller, Post, Get, Body } from '@nestjs/common';
// import { PermissionsService } from '../services/permissions.service';
// import { Permission } from '../entities/permission.entity';
//
// @Controller('permissions')
// export class PermissionsController {
//   constructor(private readonly permissionsService: PermissionsService) {}
//
//   @Post()
//   async createPermission(@Body() body: { action: string }): Promise<Permission> {
//     return this.permissionsService.createPermission(body.action);
//   }
//
//   @Get()
//   async findAllPermissions(): Promise<Permission[]> {
//     return this.permissionsService.findAllPermissions();
//   }
// }
