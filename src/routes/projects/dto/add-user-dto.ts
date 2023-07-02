import { Role } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class AddUserDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
