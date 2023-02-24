import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsOptional()
  coverImage: Buffer;

  @IsBoolean()
  @IsOptional()
  public: boolean;

  @IsDateString()
  @IsOptional()
  updatedAt: Date;
}
