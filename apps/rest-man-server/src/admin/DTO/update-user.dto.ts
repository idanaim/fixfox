// src/users/dto/update-user.dto.ts
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserPermissionsDto {
  @IsOptional()
  @IsBoolean()
  createTicket?: boolean;

  @IsOptional()
  @IsBoolean()
  readTicket?: boolean;

  @IsOptional()
  @IsBoolean()
  updateTicket?: boolean;

  @IsOptional()
  @IsBoolean()
  deleteTicket?: boolean;

  @IsOptional()
  @IsBoolean()
  manageUsers?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  password?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  mobile?: string;

  @IsOptional()
  role?: string;

  @IsOptional()
  permissions?: UpdateUserPermissionsDto; // Nest permissions here
}
