import { Controller, Get } from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { RoleDto } from '../DTO/role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll(): Promise<RoleDto[]> {
    return this.rolesService.findAll();
  }
}
