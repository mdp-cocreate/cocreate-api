import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ValidateEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
