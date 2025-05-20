// // src/permissions/permissions.controller.ts
// import { Controller, Get, Param, Put, Body, NotFoundException, UseGuards } from '@nestjs/common';
// import { PermissionsService } from '../services/permissions.service';
// import { PermissionDto } from '../DTO/permission.dtos';
// import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
//
// @Controller('permissions')
// export class PermissionsController {
//   constructor(private readonly permissionsService: PermissionsService) {}
//
//   @Get(':userId')
//   async getPermissions(@Param('userId') userId: number) {
//     return this.permissionsService.getPermissions(userId);
//   }
//
//   @Put(':userId')
//   async updatePermissions(
//     @Param('userId') userId: number,
//     @Body() permissionDto: PermissionDto,
//   ) {
//     debugger
//     return this.permissionsService.updatePermissions(userId, permissionDto);
//   }
// }
