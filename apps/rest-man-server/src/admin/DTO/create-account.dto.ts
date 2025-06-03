import { IsString, IsNotEmpty, IsPhoneNumber, IsEmail } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  adminName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  mobile: string;
}
