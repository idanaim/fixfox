// src/users/dtos/create-user.dtos.ts
import { IsBoolean, IsOptional } from 'class-validator';

export class CreateUserDto {
  // ... existing fields ...

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
