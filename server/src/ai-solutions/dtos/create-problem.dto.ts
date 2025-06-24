// create-problem.dtos.ts
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProblemDto {
  @IsString()
  @MinLength(10)
  description: string;

  @IsInt()
  businessId: number;

  @IsInt()
  userId: number;

  @IsOptional()
  @IsInt()
  equipmentId?: number;
}

// similar-problem.dtos.ts
export class SimilarProblemDto {
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;
}
