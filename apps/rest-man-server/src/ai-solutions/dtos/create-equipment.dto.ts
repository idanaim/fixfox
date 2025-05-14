// create-equipment.dto.ts
import { IsDateString, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEquipmentDto {
  @IsString()
  @MinLength(3)
  type: string;

  @IsString()
  @MinLength(2)
  manufacturer: string;

  @IsString()
  @MinLength(2)
  model: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsInt()
  businessId: number;

  @IsOptional()
  @IsDateString()
  purchaseDate?: Date;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsDateString()
  warrantyExpiration?: Date;
}

// update-equipment.dto.ts
export class UpdateEquipmentDto extends CreateEquipmentDto {}

// similar-equipment.dto.ts
export class SimilarEquipmentDto {
  @IsString()
  model: string;

  @IsString()
  manufacturer: string;

  @IsInt()
  businessId: number;
}
