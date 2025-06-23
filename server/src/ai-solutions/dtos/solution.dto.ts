import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateSolutionDto {
  @IsNumber()
  problemId: number;

  @IsString()
  @IsOptional()
  cause?: string;

  @IsString()
  treatment: string;

  @IsString()
  resolvedBy: string;

  @IsNumber()
  @IsOptional()
  cost?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  effectiveness?: number;

  @IsBoolean()
  @IsOptional()
  isExternal?: boolean;

  @IsString()
  source: string;
}

export class UpdateSolutionDto {
  @IsString()
  @IsOptional()
  cause?: string;

  @IsString()
  @IsOptional()
  treatment?: string;

  @IsNumber()
  @IsOptional()
  cost?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  effectiveness?: number;

  @IsBoolean()
  @IsOptional()
  isExternal?: boolean;
}

export class SolutionResponseDto {
  id: number;
  cause: string;
  treatment: string;
  resolvedBy: string;
  cost?: number;
  effectiveness: number;
  isExternal: boolean;
  source: string;
  createdAt: Date;
  problemId: number;
  sourceContext?: {
    type: 'current_business' | 'other_business' | 'ai_generated';
    label: string;
  };
} 