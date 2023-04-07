import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';

export class AddUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
