import { SkillName } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  shortDescription: string;

  @IsString()
  @IsOptional()
  description?: string;

  // TODO check if is Buffer
  @IsOptional()
  coverImage?: Buffer;

  @IsBoolean()
  @IsOptional()
  public?: boolean;

  @IsEnum(SkillName, { each: true })
  skills: SkillName[];
}
