import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  responseTime: number;

  @IsInt()
  @Min(1)
  @Max(5)
  price: number;

  @IsInt()
  @Min(1)
  @Max(5)
  qualityAccuracy: number;

  @IsInt()
  @Min(1)
  @Max(5)
  professionalism: number;

  @IsInt()
  @Min(1)
  @Max(5)
  efficiency: number;

  @IsInt()
  @Min(1)
  @Max(5)
  aesthetics: number;

  @IsOptional()
  @IsString()
  reviewComment?: string;
} 