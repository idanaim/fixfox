// src/users/dto/update-user.dto.ts

import { IsEnum, IsOptional, IsString, IsArray } from 'class-validator';
import { DepartmentType } from '../enums/department.enum';

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
  @IsEnum(DepartmentType)
  department?: DepartmentType;
  
  @IsOptional()
  @IsArray()
  departments?: string[];
  
  @IsOptional()
  @IsString()
  positionTitle?: string;
}
