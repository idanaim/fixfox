import { IsString, IsEnum, IsOptional, IsArray, IsPhoneNumber, ArrayMinSize } from 'class-validator';
import { ServiceType, Profession } from '../technician.entity';

export class CreateTechnicianDto {
  @IsString()
  name: string;

  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsOptional()
  @IsString()
  image?: string;

  @IsPhoneNumber()
  mobile: string;

  @IsString()
  address: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(Profession, { each: true })
  professions: Profession[];

  @IsArray()
  @ArrayMinSize(1)
  locationIds: string[];
}
