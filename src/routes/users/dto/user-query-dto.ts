import { IsEmpty, IsOptional } from 'class-validator';

export class UserQueryDto {
  @IsOptional()
  @IsEmpty()
  domains: boolean;

  @IsOptional()
  @IsEmpty()
  projects: boolean;

  @IsOptional()
  @IsEmpty()
  contributions: boolean;

  @IsOptional()
  @IsEmpty()
  actions: boolean;
}
